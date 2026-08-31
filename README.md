# LP Edenilson Mendes

Landing page de credenciamento estratégico para clínicas.
Site estático servido pelo GitHub Pages a partir da raiz da branch `main`.

- **No ar hoje:** https://kaisengt7.github.io/lp-edenilson/
- **Domínio final (canônico):** https://lp.edenilsonsmendes.com.br/

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | LP completa — HTML, CSS e JS inline, sem build |
| `politica-de-privacidade.html` | Página legal (`noindex`) |
| `termos-de-uso.html` | Página legal (`noindex`) |
| `robots.txt` | Libera crawlers de busca e de IA; aponta o sitemap |
| `sitemap.xml` | Só a home — as páginas legais são `noindex` de propósito |
| `llms.txt` | Resumo legível por LLM (GEO) — fatos, método M.A.P.A., limites de uso |
| `assets/og-image.jpg` | Card social 1200×630 gerado por ffmpeg |
| `design-system.html` | Referência de tokens e componentes (não publicada) |

## SEO / GEO

- Meta tags, canonical, Open Graph e Twitter Card no `<head>` do `index.html`.
- JSON-LD com 7 entidades num único `@graph`: `WebSite`, `WebPage`, `ImageObject`,
  `ProfessionalService`, `Person`, `Service` (com o método M.A.P.A. em `hasOfferCatalog`)
  e `FAQPage` com as 6 objeções da seção `#objecoes`.
- `robots.txt` libera explicitamente GPTBot, ClaudeBot, PerplexityBot, Google-Extended
  e afins, para que a LP possa ser lida e citada por assistentes de IA.

> **Regra de imagem:** toda imagem da LP é convertida para WebP.
> `assets/og-image.jpg` é a exceção deliberada — vários scrapers sociais
> (WhatsApp e LinkedIn, principalmente) ainda não renderizam `og:image` em WebP.

### Regenerar o card social

O comando ffmpeg completo que gerou `assets/og-image.jpg` está no histórico do commit
que adicionou o arquivo. Fonte: `assets/edenilson-3.png` (RGBA, recorte com alpha —
usar o `.png` e não o `.webp`, cujo alpha é subamostrado e serrilha a borda).

---

## Pendências

### 1. Apontar o domínio `lp.edenilsonsmendes.com.br`

Todas as URLs canônicas, OG, `sitemap.xml` e `llms.txt` já apontam para o domínio final,
mas **ele ainda não resolve**. O domínio `edenilsonsmendes.com.br` está registrado
(nameservers HostGator); falta criar o subdomínio.

Enquanto o DNS não estiver no ar:

- **Não** cadastrar `kaisengt7.github.io/lp-edenilson/` no Search Console nem pedir
  indexação — a canônica aponta para uma URL que ainda não responde, e o Google pode
  simplesmente descartar a página.

Para publicar:

1. Criar registro `CNAME` de `lp` → `kaisengt7.github.io` no painel de DNS.
2. Em *Settings → Pages* do repositório, definir o custom domain como
   `lp.edenilsonsmendes.com.br` (isso cria o arquivo `CNAME` na raiz).
3. Marcar *Enforce HTTPS* depois que o certificado for emitido.
4. Só então cadastrar a propriedade no Search Console e enviar o `sitemap.xml`.

O GitHub Pages passa a devolver 301 do `.github.io` para o domínio próprio
automaticamente, então não há conteúdo duplicado.

### 2. Links do rodapé estão como `href="#"`

Instagram, YouTube e WhatsApp no rodapé (`index.html`, ~linha 1513) são placeholders.
Quando as URLs reais existirem:

- [ ] Trocar os três `href="#"` pelas URLs reais.
- [ ] Transformar `contato@edenilsonmendes.com` em `mailto:`.
- [ ] Adicionar `sameAs` no JSON-LD (`ProfessionalService` e `Person`) com os perfis —
      é o que conecta a marca aos perfis sociais no Knowledge Graph.
- [ ] Adicionar as mesmas URLs na seção de contato do `llms.txt`.
- [ ] Se houver WhatsApp comercial, adicionar `telephone` no `ProfessionalService`.

### 3. Divergência no domínio do e-mail

O rodapé e o `llms.txt` trazem `contato@edenilsonmendes.com` (sem "s", `.com`),
mas o domínio registrado é `edenilsonsmendes.com.br` (com "s", `.com.br`).
Confirmar com o cliente qual é o e-mail válido e alinhar rodapé, `llms.txt`
e o campo `email` do JSON-LD.

### 4. Herói duplicado no DOM

O hero existe duas vezes no HTML (bloco mobile e bloco `.hero-desktop`), alternados
por CSS. O `<h1>` do bloco desktop foi rebaixado para `<h2>` para não haver dois `<h1>`,
mas a copy do hero continua duplicada no DOM. Não é crítico (indexação é mobile-first),
porém unificar os dois blocos num só, com CSS responsivo, seria o ideal numa refatoração.

### 5. Pixel da Meta só dispara após consentimento

`TRACKING.metaPixelId` = `659130597219654`, carregado apenas depois do aceite no banner
de cookies. Quem recusa ou ignora não é rastreado — o volume no Gerenciador de Anúncios
fica abaixo do tráfego real, por decisão de conformidade com a LGPD.
O `<noscript>` do snippet oficial foi omitido de propósito: ele dispararia o PageView
por fora do consentimento.
