import { enrichTemplate } from '@email/utils'

const documentsApprovedTemplate = enrichTemplate({
  subject: 'Documentação Aprovada - Segunda Casa 🏡',
  markdownBody: `# Parabéns, {{ name }}! 🎉

Toda a sua documentação para o perfil de **{{ role }}** foi analisada e **aprovada** com sucesso.

Agora você tem acesso completo aos recursos correspondentes ao seu perfil na plataforma.

Com carinho,  
**Equipe Segunda Casa** 🏡`
})

export default documentsApprovedTemplate