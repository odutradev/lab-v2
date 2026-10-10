import { Box, Stack, Title, Text } from '@mantine/core'

import Card, { CardContent } from '@components/ui/card'
import TermsHeader from './components/termsHeader'
import {
  containerStyle,
  sectionTitleStyle,
  textStyle,
  highlightBoxStyle
} from './styles'
import useTermsOfServicePage from './hook'

import type { TermsOfServicePageProps } from './types'

export const TermsOfServicePage = ({ onBack }: TermsOfServicePageProps) => {
  const { lastUpdated, handleBack } = useTermsOfServicePage({ onBack })

  return (
    <Box style={containerStyle}>
      <TermsHeader lastUpdated={lastUpdated} onBack={handleBack} />

      <Card>
        <CardContent>
          <Stack gap="xl">
            <Box>
              <Title order={3} style={sectionTitleStyle}>
                1. Aceitação dos Termos
              </Title>
              <Text style={textStyle}>
                Ao acessar, registrar-se ou utilizar a plataforma Lab (&quot;Serviço&quot;), você declara que leu, compreendeu e concorda expressamente em ficar vinculado por estes Termos de Serviço e por nossa Política de Privacidade. Caso discorde de qualquer disposição destes termos, você não deve utilizar a plataforma.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                2. Descrição do Serviço
              </Title>
              <Text style={textStyle}>
                O Lab é uma aplicação de gerenciamento de rotina pessoal, produtividade e rastreamento de hábitos (como sono, ingestão hídrica, metas e atividades diárias), permitindo o acompanhamento de progresso e a organização da saúde e rotina diária do usuário.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                3. Cadastro e Segurança da Conta
              </Title>
              <Text style={textStyle}>
                Para usufruir dos recursos da plataforma, você deve criar uma conta fornecendo dados verdadeiros e atualizados. Você é integralmente responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrerem sob sua conta. Notifique-nos imediatamente caso suspeite de qualquer violação de segurança.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                4. Uso de Serviços e APIs de Terceiros (Google)
              </Title>
              <Text style={textStyle}>
                A plataforma permite integração opcional com serviços do Google (incluindo autenticação Google Sign-In e sincronização de eventos com o Google Calendar). Ao utilizar essas integrações:
              </Text>

              <Box style={highlightBoxStyle}>
                <Text style={{ ...textStyle, color: '#cffafe', fontWeight: 500 }}>
                  Uso Autorizado e Transparência:
                </Text>
                <Text style={{ ...textStyle, fontSize: '0.9rem', marginTop: 4 }}>
                  Você autoriza o Lab a acessar os escopos estritamente solicitados durante o fluxo de consentimento. O tratamento de quaisquer dados recebidos de APIs do Google respeita a Política de Dados do Usuário dos Serviços de API do Google, garantindo que suas informações não sejam transferidas indevidamente ou comercializadas.
                </Text>
              </Box>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                5. Conduta e Responsabilidades do Usuário
              </Title>
              <Text style={textStyle}>
                Você concorda em não:
              </Text>
              <Box mt="xs">
                <Text style={textStyle}>
                  • Violar leis, regulamentos ou direitos de propriedade intelectual de terceiros.
                </Text>
                <Text style={textStyle}>
                  • Tentar acessar sem autorização áreas restritas, servidores, banco de dados ou redes vinculadas ao serviço.
                </Text>
                <Text style={textStyle}>
                  • Praticar engenharia reversa, descompilação ou ataques de sobrecarga (DDoS) contra nossa infraestrutura.
                </Text>
                <Text style={textStyle}>
                  • Utilizar o serviço para disseminação de conteúdos maliciosos ou automatizados sem consentimento prévio.
                </Text>
              </Box>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                6. Propriedade Intelectual
              </Title>
              <Text style={textStyle}>
                Todo o design, código-fonte, marcas, logotipos, layout e funcionalidades da aplicação pertencem exclusivamente aos desenvolvedores do Lab. É proibida a reprodução, cópia ou distribuição sem autorização formal expressa.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                7. Isenção de Garantias e Limitação de Responsabilidade
              </Title>
              <Text style={textStyle}>
                O serviço é fornecido &quot;no estado em que se encontra&quot; e &quot;conforme disponível&quot;. Embora nos esforcemos para manter a máxima estabilidade, não garantimos que a operação será ininterrupta ou isenta de erros temporários. Os dados de hábitos e saúde registrados têm finalidade de organização pessoal e não substituem aconselhamento médico ou profissional especializado.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                8. Alterações nos Termos e Rescisão
              </Title>
              <Text style={textStyle}>
                Podemos revisar e atualizar estes termos periodicamente. O uso contínuo da aplicação após a publicação de versões atualizadas constituirá sua aceitação das modificações. Você pode encerrar sua conta a qualquer momento por meio das configurações da plataforma ou contatando o suporte.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                9. Contato
              </Title>
              <Text style={textStyle}>
                Em caso de dúvidas a respeito destes Termos de Serviço, entre em contato através do e-mail:{' '}
                <a
                  href="mailto:contato@odutra.com"
                  style={{ color: '#06b6d4', textDecoration: 'underline' }}
                >
                  contato@odutra.com
                </a>
                .
              </Text>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TermsOfServicePage
