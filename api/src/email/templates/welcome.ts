import { enrichTemplate } from '@email/utils'

const welcomeTemplate = enrichTemplate({
  subject: 'Bem-vindo(a) à Segunda Casa! 🏡',
  markdownBody: `# Olá, {{ name }}! ✨

Que alegria ter você conosco na **Segunda Casa**! Nosso objetivo é proporcionar a melhor experiência para você encontrar o seu próximo lar ou gerenciar os seus imóveis com total tranquilidade.

---

### 🚀 Próximos Passos:
- **Conclua seu cadastro:** Deixe seu perfil completo para facilitar a comunicação.
- **Explore os imóveis:** Navegue por opções incríveis e encontre o lugar ideal.
- **Precisa de ajuda?** Se tiver qualquer dúvida, basta responder diretamente a este e-mail.

Seja muito bem-vindo(a) à nossa comunidade!

Com carinho,  
**Equipe Segunda Casa** 🏡`
})

export default welcomeTemplate