# Documentação técnica do bios-webapp

🇧🇷 **Português** · 🇺🇸 [English](en/README.md)

[← Voltar ao README do projeto](../README.md)

Como o app funciona por dentro: cada tela, as regras que ela segue e onde ela está no código. Os
requisitos, os casos de uso e a modelagem ficam no repositório
[bios-docs](https://github.com/odavibatista/bios-docs); aqui os mesmos identificadores (UC, RF, NF,
INL) apontam de volta para eles.

## Índice

| Nº  | Documento                                                      | Conteúdo                                                              |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| 01  | [Como rodar](01-Como-Rodar.md)                                 | Instalação, scripts, tipos da API e caminhos no Windows               |
| 02  | [Arquitetura](02-Arquitetura.md)                               | Camada de dados, sessão, casca do painel e estados de tela            |
| 03  | [Contas e acesso](03-Contas-e-Acesso.md)                       | Cadastro, login, senha, conta, chaves de API e administração          |
| 04  | [Empresas e índices](04-Empresas-e-Índices.md)                 | Perfil, evidências, índices por ODS, pesquisa, exportação e setores   |
| 05  | [Dados da versão de apresentação](05-Dados-de-Apresentação.md) | Como as respostas reais da API são capturadas, guardadas e conferidas |
| 06  | [Qualidade e testes](06-Qualidade-e-Testes.md)                 | Acessibilidade nos e2e, trava de acentuação e fluxo de contribuição   |
| 07  | [Tema e publicação](07-Tema-e-Publicação.md)                   | Paleta do BIOS no Material 3 e publicação estática na Vercel          |

## Por onde começar

- **Vai rodar o app?** [01. Como rodar](01-Como-Rodar.md).
- **Vai criar ou mudar uma tela?** [02. Arquitetura](02-Arquitetura.md), depois o capítulo da área.
- **Vai integrar com a API real?** [02. Arquitetura](02-Arquitetura.md) e
  [05. Dados da versão de apresentação](05-Dados-de-Apresentação.md).
