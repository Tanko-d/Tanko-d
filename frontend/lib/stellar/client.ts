import { Horizon, Networks } from '@stellar/stellar-sdk'

export type StellarNetwork = 'testnet' | 'public'

export const networkConfig = {
  testnet: {
    networkPassphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  public: {
    networkPassphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    friendbotUrl: '',
  },
}

export function getNetworkConfig(): typeof networkConfig.testnet {
  const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet') as StellarNetwork
  return networkConfig[network]
}

export function getHorizonServer(): Horizon.Server {
  const config = getNetworkConfig()
  return new Horizon.Server(config.horizonUrl)
}

export function getNetworkPassphrase(): string {
  const config = getNetworkConfig()
  return config.networkPassphrase
}

export { Horizon, Networks }
