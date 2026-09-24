# Site da Connect Alpha

Site da própria agência: HTML, CSS e JS puros, sem dependências externas (as fontes também ficam no próprio site). Endereço definitivo: https://connectalpha.com.br (domínio a registrar).

## O que tem

- **Abertura com demonstração animada:** busca no Google, a empresa 5,0 com o site dando erro, o cliente indo para o concorrente, e então a seta da marca trazendo o site real de um cliente e uma mensagem no WhatsApp.
- **Trilha de luz (só no computador):** uma linha vermelha desce pela margem conforme a pessoa rola, acende o marcador de cada seção e termina no símbolo, acima do botão final do WhatsApp.
- **Diagnóstico gratuito:** 7 perguntas do checklist de prospecção. O resultado sai com nota, os pontos a melhorar e o botão que manda tudo para o WhatsApp. Nada é salvo.
- **Menu de celular**, 3 casos de clientes, planos com preço, dúvidas, privacidade e 404.
- Respeita "reduzir movimento" do sistema: sem animação, a demonstração já aparece no estado final.

## Como editar

**Nunca edite `site/*.html` direto.** Tudo é montado por `../_apoio/gerar-paginas.mjs` (pasta oculta):

- página principal: `_apoio/paginas/inicio.html`
- cabeçalho, rodapé e ícones (iguais em todas as páginas): `_apoio/partes/`
- casos, privacidade e 404: dentro do próprio `gerar-paginas.mjs` (cliente novo = novo item na lista `casos`)

Depois de editar, rode:

    node "12. Site Connect Alpha/_apoio/gerar-paginas.mjs"

Ele monta as páginas, gera o `sitemap.xml` e troca `{{wa|mensagem}}` pelo link do WhatsApp (35) 99887-2633 com a mensagem pronta.

Estilos em `assets/css/site.css` e interações em `assets/js/site.js` (esses são editados direto).

## Conferir

    node "_ferramentas/preview-local.mjs" "12. Site Connect Alpha/site" 8765

Testes automáticos em `_apoio/`: `prints.mjs` (página inteira em várias larguras) e `teste.mjs` (demonstração, diagnóstico, trilha e menu). Última medição no Lighthouse (celular, servidor local sem compressão): desempenho 93, acessibilidade 100, boas práticas 100, SEO 100.

## Publicar

GitHub + Vercel, igual aos clientes. O domínio entra pelos registros A/CNAME no Registro.br, sem trocar os servidores de DNS.
