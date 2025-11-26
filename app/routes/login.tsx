import type { Route } from './+types/login';
import { SignIn, SignedIn, SignedOut } from '@clerk/react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useI18n } from '../i18n/i18n-provider';
import { getPageMeta } from '../i18n/page-copy';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('login');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Login() {
  const { redirectTo } = useLoaderData<{ redirectTo: string }>();
  const navigate = useNavigate();
  const { messages } = useI18n();
  const loginCopy = messages.login;

  return (
    <PageShell title={loginCopy.title} description={loginCopy.description}>
      <div className="mx-auto w-full max-w-lg space-y-6">
        <SignedOut>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{loginCopy.signedOutCardTitle}</CardTitle>
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
              <CardTitle className="text-xl">{loginCopy.signedInCardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{loginCopy.signedInDescription}</p>
              <p className="text-[var(--color-muted)]">
                Continue para o seu painel ou escolha outro destino usando o menu lateral.
              </p>
              <Button onClick={() => navigate(redirectTo ?? '/perfil')}>
                {loginCopy.buttonLabel}
              </Button>
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
