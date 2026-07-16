# Pedro Batista — Executive Portfolio

App web estática, mobile-first e pronta a publicar. Inclui:

- todos os 10 visuais do portefólio e as 2 páginas do CV;
- CV e portefólio originais em PDF;
- navegação por percurso, projetos e áreas de impacto;
- filtros, visualização em ecrã inteiro e zoom;
- botões diretos para WhatsApp, email e LinkedIn;
- partilha nativa no telemóvel;
- funcionamento offline depois da primeira visita (PWA).

## Ver localmente

Na pasta desta app, iniciar um servidor local:

```powershell
python -m http.server 8080
```

Depois abrir `http://localhost:8080`.

## Publicar e partilhar por WhatsApp

O conteúdo deve estar num endereço HTTPS público. Opções simples:

1. GitHub Pages: colocar esta pasta num repositório e ativar Pages na branch principal.
2. Netlify Drop: arrastar a pasta inteira para a área de publicação do Netlify.
3. Cloudflare Pages: ligar um repositório e publicar sem comando de build.

Depois de publicado, abrir o endereço no telemóvel e usar o botão **Share portfolio**. A imagem de pré-visualização para WhatsApp já está incluída em `assets/images/og-image.jpg`.

> Nota: para garantir que o WhatsApp apresenta a imagem de pré-visualização, substituir o valor relativo de `og:image` em `index.html` pelo endereço HTTPS absoluto da imagem após a publicação.
