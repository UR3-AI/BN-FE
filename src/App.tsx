import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@lib/apis'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-blue-600">Hello, React!</h1>
      </div>
    </QueryClientProvider>
  )
}

export default App
