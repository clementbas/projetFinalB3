import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est sur la page de login
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // Pour les autres pages, vérifier l'authentification côté client
  // (vous pourriez améliorer cela avec une vérification côté serveur)
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}