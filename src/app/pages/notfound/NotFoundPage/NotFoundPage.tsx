import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-gray-400">404</h1>
      <p className="text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link to="/" className="text-blue-600 hover:underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}

export default NotFoundPage
