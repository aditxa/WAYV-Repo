import ConnectionStatus from '../ConnectionStatus'

export default function ConnectionStatusExample() {
  return (
    <ConnectionStatus 
      onConnect={() => console.log('Connection established')}
      onDisconnect={() => console.log('Connection closed')}
    />
  )
}