# ARVO landing page

Três prévias estáticas baseadas no briefing comercial de 23/11/2026.

- Editorial em `/editorial/`
- Duas rotas em `/rotas/`
- Manifesto em `/manifesto/`

## Executar

Requer Node.js 22 ou superior. Sem dependências npm.

```sh
npm run build
npm run preview
```

Acesse http://127.0.0.1:4173. A pasta `dist` contém as páginas geradas.

O conteúdo fica em `src/content.mjs`, os templates em `src/build.mjs` e os estilos em `assets/style.css`. Os módulos de motion foram fornecidos pela skill design-taste-frontend. O projeto usa entrada de hero, interações de hover, destaque tipográfico e capítulos de processo vinculados à rolagem. Respeita movimento reduzido e mantém o conteúdo em HTML.

## Informações a confirmar

O Instagram `@arvo.advisory` segue a identidade enviada e o briefing. Confirmar conta oficial, dados institucionais e links jurídicos antes de uma publicação definitiva. As prévias usam `noindex`. Valores e prazos são definidos sob proposta. O processo contém um exemplo ilustrativo, sem métricas de desempenho.

As imagens originais devem estar em `assets/brand/logo.jpeg` e `assets/brand/identity.jpeg`. A marca é utilizada nas páginas sem redesenhar o símbolo.
