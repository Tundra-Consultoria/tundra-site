/* ===================================================================
   Função serverless (Vercel) — recebe o formulário de contato do site
   e envia a mensagem por e-mail via Resend (https://resend.com).

   NÃO é um servidor que você mantém: a Vercel executa este arquivo
   sob demanda, só quando alguém envia o formulário.

   Variáveis de ambiente (configure no painel da Vercel → Settings →
   Environment Variables):
     RESEND_API_KEY  (obrigatória) chave da API do Resend
     CONTACT_TO      (obrigatória) e-mail que recebe as mensagens
                      ex: contato@tundraconsultoria.com.br
     CONTACT_FROM    (opcional) remetente. Para produção use um e-mail
                      de um domínio verificado no Resend, ex:
                      "Tundra Site <site@tundraconsultoria.com.br>".
                      Padrão de teste: "Tundra Site <onboarding@resend.dev>"
                      (o Resend só entrega esse remetente de teste para o
                       e-mail do dono da conta).
=================================================================== */

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Método não permitido." });
  }

  var apiKey = process.env.RESEND_API_KEY;
  var to = process.env.CONTACT_TO;
  var from = process.env.CONTACT_FROM || "Tundra Site <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("Faltam variáveis de ambiente RESEND_API_KEY e/ou CONTACT_TO.");
    return res.status(500).json({ ok: false, error: "E-mail não configurado no servidor." });
  }

  var body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  var nome = String(body.nome || "").trim();
  var email = String(body.email || "").trim();
  var empresa = String(body.empresa || "").trim();
  var mensagem = String(body.mensagem || "").trim();
  var honeypot = String(body.site || "").trim();

  // Honeypot anti-spam: o campo "site" é invisível para humanos. Se veio
  // preenchido, é bot — respondemos "sucesso" e descartamos sem enviar.
  if (honeypot) return res.status(200).json({ ok: true });

  if (!nome || !mensagem || !isEmail(email)) {
    return res.status(400).json({ ok: false, error: "Preencha nome, um e-mail válido e a mensagem." });
  }

  // Limites simples para evitar abuso.
  if (nome.length > 120 || empresa.length > 160 || mensagem.length > 5000) {
    return res.status(400).json({ ok: false, error: "Conteúdo muito longo." });
  }

  var subject = "Contato pelo site — " + nome + (empresa ? " (" + empresa + ")" : "");
  var text =
    "Nome: " + nome + "\n" +
    "E-mail: " + email + "\n" +
    "Empresa: " + (empresa || "-") + "\n\n" +
    "Mensagem:\n" + mensagem + "\n";

  try {
    var resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email, // responder no e-mail vai direto para o lead
        subject: subject,
        text: text,
      }),
    });

    if (!resp.ok) {
      var detail = await resp.text();
      console.error("Erro do Resend:", resp.status, detail);
      return res.status(502).json({ ok: false, error: "Não foi possível enviar agora. Tente novamente." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Falha ao enviar e-mail:", err);
    return res.status(502).json({ ok: false, error: "Não foi possível enviar agora. Tente novamente." });
  }
};

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
