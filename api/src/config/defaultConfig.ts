import packageJson from '../../package.json'

const defaultApiConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  version: packageJson.version,
  clusterName: 'offline'
}

export default defaultApiConfig