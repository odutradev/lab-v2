import { enrichTemplate } from '@email/utils'

const welcomeTemplate = enrichTemplate({
  subject: 'Bem-vindo(a) ao Lab! ✨',
  markdownBody: `# Olá, {{ name }}! ✨

Que alegria ter você conosco no **Lab**! Nosso objetivo é proporcionar a melhor experiência para você na nossa plataforma com total tranquilidade.

---

### 🚀 Próximos Passos:
- **Conclua seu cadastro:** Deixe seu perfil completo para facilitar a comunicação.
- **Explore a plataforma:** Navegue pelas opções disponíveis e aproveite todos os recursos.
- **Precisa de ajuda?** Se tiver qualquer dúvida, basta responder diretamente a este e-mail.

Seja muito bem-vindo(a) à nossa comunidade!

Com carinho,  
**Equipe Lab**`
})

export default welcomeTemplate