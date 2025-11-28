export default function LoadingAuth() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white/80 backdrop-blur-sm">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-700 text-sm">Verificando sesión...</p>
      </div>
    </div>
  );
}
