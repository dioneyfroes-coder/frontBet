import type { Route } from './+types/login';
import { SignIn, SignedIn, SignedOut } from '@clerk/react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Login - FrontBet' },
    {
      name: 'description',
      content:
        'Entre na sua conta FrontBet e acompanhe palpites, limites e histórico em tempo real.',
    },
  ];
}

export default function Login() {
  const { redirectTo } = useLoaderData<{ redirectTo: string }>();
  const navigate = useNavigate();

  return (
    <PageShell
      title="Entrar na FrontBet"
      description="Use suas credenciais para continuar apostando com segurança."
    >
      <div className="mx-auto w-full max-w-lg space-y-6">
        <SignedOut>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Acesse sua conta</CardTitle>
            </CardHeader>
            <CardContent>
              <SignIn
                routing="path"
                path="/login"
                redirectUrl={redirectTo ?? '/perfil'}
                appearance={{ variables: { colorPrimary: '#0ea5e9' } }}
              />
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <Card>
            <CardHeader>
              <CardTitle>Você já está autenticado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--color-muted)]">
                Continue para o seu painel ou escolha outro destino usando o menu lateral.
              </p>
              <Button onClick={() => navigate(redirectTo ?? '/perfil')}>Ir para o painel</Button>
            </CardContent>
          </Card>
        </SignedIn>
      </div>
    </PageShell>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/perfil';
  return { redirectTo };
}
