# 07. Tema e publicação

🇧🇷 **Português** · 🇺🇸 [English](en/07-Theme-and-Publishing.md)

[Índice da documentação](README.md) · ← [06. Qualidade e testes](06-Qualidade-e-Testes.md)

> Paleta do BIOS no Material 3 e publicação estática na Vercel.

## Tema

As cores vêm da apresentação do projeto (`bios-docs/assets/BIOS - PPTX.pptx`). As paletas do Material 3
(`src/styles/_theme-colors.scss`) foram geradas com `ng generate @angular/material:theme-color`, e as
cores exatas ficam como variáveis CSS para a marca e os gráficos:

| Variável             | Cor       | Uso                               |
| -------------------- | --------- | --------------------------------- |
| `--bios-brand-green` | `#2C5F2D` | Primária: barra superior, títulos |
| `--bios-brand-leaf`  | `#97BC62` | Terciária: destaques              |
| `--bios-brand-moss`  | `#5B6B5B` | Texto de apoio                    |
| `--bios-brand-ink`   | `#1A1A1A` | Texto                             |
| `--bios-brand-paper` | `#F5F5F5` | Superfícies, rodapé               |

## Publicação (Vercel)

A versão de apresentação é estática e é publicada na Vercel (plano Hobby) a cada merge na `main`.
`vercel.json` define a instalação (o mesmo npm 11 do CI), o build (`npm run build`), a pasta publicada
(`dist/bios-webapp/browser`) e a reescrita de toda rota para `index.html`, para um link profundo
(`/empresas/<cnpj>`) abrir direto. O rodapé avisa que os dados são capturados, e um e2e confere que o site
não faz nenhuma requisição fora da própria origem: não há API real nem segredo no build.

Para criar o projeto (uma vez):

1. Em vercel.com, **Add New → Project → Import** o repositório `odavibatista/bios-webapp`.
2. **Framework Preset:** Other (o `vercel.json` já traz instalação, build e saída). Nenhuma variável de
   ambiente.
3. Depois de criado: **Settings → Git → Production Branch:** `main`; **Settings → Build and Deployment →
   Node.js Version:** 22.x, o mesmo do Volta.
4. Conferir no endereço público: a página inicial abre, e uma rota inexistente (`/rota-que-nao-existe`)
   mostra a página "não encontrado" do app, e não o 404 da Vercel.
