import { Box, Stack, Title, Text } from '@mantine/core'

import Card, { CardContent } from '@components/ui/card'
import PrivacyHeader from './components/privacyHeader'
import {
  containerStyle,
  sectionTitleStyle,
  textStyle,
  highlightBoxStyle
} from './styles'
import usePrivacyPolicyPage from './hook'

import type { PrivacyPolicyPageProps } from './types'

export const PrivacyPolicyPage = ({ onBack }: PrivacyPolicyPageProps) => {
  const { lastUpdated, handleBack } = usePrivacyPolicyPage({ onBack })

  return (
    <Box style={containerStyle}>
      <PrivacyHeader lastUpdated={lastUpdated} onBack={handleBack} />

      <Card>
        <CardContent>
          <Stack gap="xl">
            <Box>
              <Title order={3} style={sectionTitleStyle}>
                1. Visão Geral e Compromisso
              </Title>
              <Text style={textStyle}>
                Esta Política de Privacidade descreve como a plataforma Lab (&quot;nós&quot;, &quot;nosso&quot; ou &quot;aplicação&quot;) coleta, armazena, utiliza e protege os seus dados pessoais quando você acessa ou utiliza nossos serviços. Nosso compromisso é garantir total privacidade, segurança e transparência com relação aos dados sob nossa custódia, em conformidade com as leis de proteção de dados aplicáveis (incluindo a LGPD).
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                2. Informações que Coletamos
              </Title>
              <Text style={textStyle}>
                Coletamos apenas as informações estritamente necessárias para o funcionamento seguro e personalizado da plataforma:
              </Text>
              <Box mt="xs">
                <Text style={textStyle}>
                  • <strong>Dados de Cadastro:</strong> Nome, endereço de e-mail e credenciais de autenticação quando você cria uma conta diretamente.
                </Text>
                <Text style={textStyle}>
                  • <strong>Dados de Hábitos e Produtividade:</strong> Informações sobre rotinas, hábitos, sono, ingestão de água e metas cadastradas por você.
                </Text>
                <Text style={textStyle}>
                  • <strong>Dados de Autenticação de Terceiros:</strong> Quando você opta por autenticar-se utilizando serviços como o Google OAuth, recebemos seu identificador único do Google, nome e endereço de e-mail verificado.
                </Text>
              </Box>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                3. Integração com APIs e Serviços do Google
              </Title>
              <Text style={textStyle}>
                A aplicação oferece integração com os serviços do Google para fins exclusivos de autenticação de usuários (Google Sign-In) e, quando expressamente autorizado pelo usuário, sincronização com ferramentas de produtividade como o Google Calendar.
              </Text>

              <Box style={highlightBoxStyle}>
                <Text style={{ ...textStyle, color: '#e0e7ff', fontWeight: 500 }}>
                  Declaração de Conformidade com o Google User Data Policy:
                </Text>
                <Text style={{ ...textStyle, fontSize: '0.9rem', marginTop: 4 }}>
                  O uso e a transferência para qualquer outro aplicativo de informações recebidas das APIs do Google cumprirão a{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#818cf8', textDecoration: 'underline' }}
                  >
                    Google API Services User Data Policy
                  </a>
                  , incluindo os requisitos de Uso Limitado (Limited Use requirements).
                </Text>
              </Box>

              <Text style={textStyle}>
                Nenhum dado pessoal ou de calendário obtido por meio do Google é compartilhado com terceiros ou utilizado para veiculação de anúncios, marketing direcionado ou treinamento de modelos de linguagem de inteligência artificial.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                4. Finalidade do Tratamento de Dados
              </Title>
              <Text style={textStyle}>
                Seus dados são utilizados exclusivamente para:
              </Text>
              <Box mt="xs">
                <Text style={textStyle}>
                  • Autenticar sua identidade e manter sua sessão segura.
                </Text>
                <Text style={textStyle}>
                  • Fornecer e sincronizar seus registros de hábitos e produtividade.
                </Text>
                <Text style={textStyle}>
                  • Enviar comunicações essenciais de serviço (como confirmação de e-mail e redefinição de senha).
                </Text>
                <Text style={textStyle}>
                  • Garantir a integridade, estabilidade e prevenção a fraudes no sistema.
                </Text>
              </Box>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                5. Compartilhamento e Armazenamento Seguro
              </Title>
              <Text style={textStyle}>
                Não vendemos, alugamos nem transferimos suas informações pessoais para anunciantes ou corretores de dados. Os dados são armazenados em servidores protegidos por criptografia de dados em trânsito (TLS/HTTPS) e em repouso. O acesso é restrito apenas a processos automatizados necessários para a operação do sistema.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                6. Seus Direitos e Exclusão de Dados
              </Title>
              <Text style={textStyle}>
                Você tem o direito de acessar, atualizar, corrigir ou solicitar a exclusão definitiva dos seus dados a qualquer momento. Caso deseje revogar autorizações concedidas a integrações como Google, você pode fazê-lo diretamente nas configurações da sua conta Google ou solicitando através do nosso canal de suporte.
              </Text>
            </Box>

            <Box>
              <Title order={3} style={sectionTitleStyle}>
                7. Contato e Encarregado de Dados
              </Title>
              <Text style={textStyle}>
                Se você tiver dúvidas, solicitações ou preocupações sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, entre em contato através do e-mail oficial:{' '}
                <a
                  href="mailto:contato@odutra.com"
                  style={{ color: '#818cf8', textDecoration: 'underline' }}
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

export default PrivacyPolicyPage
