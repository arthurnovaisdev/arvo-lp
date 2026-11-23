# ARVO landing page

Landing page da ARVO baseada na direção visual Manifesto, com animações de entrada, núcleo orbital, ticker e interações de rolagem. O contato principal abre uma conversa com a ARVO no WhatsApp.

## Desenvolvimento

Requer Node.js 22 ou superior. Não há dependências npm.

```sh
npm run build
npm run preview
```

Acesse `http://127.0.0.1:4173`. A página publicada fica em `dist/index.html` e os arquivos de origem estão em `src/` e `assets/`.

O movimento pode ser pausado na página e respeita a preferência por movimento reduzido do navegador. A página continua marcada com `noindex` enquanto estiver em fase de revisão.
