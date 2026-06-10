# Tundra Consultoria — Site institucional

Site institucional **estático** (apenas front-end) para a Tundra Consultoria,
focada em soluções de software e automação.

- `index.html` — estrutura e conteúdo
- `styles.css` — estilos e paleta de cores
- `script.js` — menu mobile, animações no scroll e envio do formulário
- `api/contato.js` — função serverless (Vercel) que envia o formulário por e-mail

O front-end não tem build nem dependências. O envio de e-mail usa uma única
função serverless que a **Vercel** executa sob demanda (você não mantém servidor).

## Paleta de cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Gelo | `#eaedf6` | Fundos e seções amplas |
| Verde pastel | `#a4b893` | Acento secundário |
| Laranja pastel | `#b87968` | Acento secundário |
| Grafite | `#232a36` | Texto e seções escuras |

Para alterar, edite as variáveis no topo de `styles.css` (bloco `:root`).

## Testar localmente

Basta abrir o `index.html`. Para servir como um servidor real (recomendado):

```bash
# Python 3
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Hospedagem (Vercel — grátis)

Como o formulário usa uma função em `api/`, publique na **Vercel** para o envio
funcionar (no GitHub Pages a função não roda).

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** e importe o repo.
3. Framework Preset: **Other**. Build Command e Output: deixe em branco (a Vercel
   serve a raiz como estática e detecta a pasta `api/` sozinha).
4. Configure as variáveis de ambiente (passo abaixo) e clique em **Deploy**.

HTTPS, domínio `*.vercel.app` e deploy automático a cada `git push` já vêm prontos.
Para usar `tundraconsultoria.com.br`, registre o domínio (ex.: Registro.br) e
aponte-o em **Settings → Domains**.

## Formulário de contato (sem manter servidor)

Ao enviar, o `script.js` faz um `POST` para `/api/contato`, que manda a mensagem
por e-mail usando o [Resend](https://resend.com) (free: ~3.000 e-mails/mês). O
e-mail de **destino** é uma variável de ambiente — nada fica exposto no front-end.

### 1. Conta no Resend
- Crie uma conta gratuita e gere uma **API key** em *API Keys*.
- Para o remetente: dá para começar com o domínio de teste do Resend
  (`onboarding@resend.dev`, que só entrega para o e-mail do dono da conta).
  Para produção, verifique seu domínio no Resend e use um remetente próprio.

### 2. Variáveis de ambiente (Vercel → Settings → Environment Variables)
Veja `.env.example`. As que importam:

| Variável | Obrigatória | Para quê |
|----------|:-----------:|----------|
| `RESEND_API_KEY` | sim | chave da API do Resend |
| `CONTACT_TO` | sim | e-mail que **recebe** as mensagens |
| `CONTACT_FROM` | não | remetente (domínio verificado, em produção) |

Após adicionar/alterar variáveis, faça um novo deploy (ou *Redeploy*).

### 3. Testar localmente (opcional)
A função `api/` não roda com o `python -m http.server`. Use a CLI da Vercel:

```bash
npm i -g vercel
vercel dev   # lê as variáveis do arquivo .env local
```

## Personalizar

- **Destino dos e-mails:** variável `CONTACT_TO` (não está mais no código).
- **Contato exibido:** troque o e-mail e o WhatsApp em `index.html` (seção `#contato`).
- **Textos/serviços:** edite diretamente o `index.html`.
- **Logo:** o símbolo é um SVG inline no cabeçalho e no rodapé.
