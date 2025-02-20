import '@fontsource/ibm-plex-mono'
import 'inter-ui/inter.css'

import { useCallback, useMemo, useState } from 'react'
import { Box, Skeleton } from '@chakra-ui/react'
import { ThemeProvider } from '@opengovsg/design-system-react'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import {
  type Args,
  type Decorator,
  type Loader,
  type Parameters,
  type ReactRenderer,
} from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { format } from 'date-fns/format'
import merge from 'lodash/merge'
import mockdate from 'mockdate'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { ErrorBoundary } from 'react-error-boundary'
import superjson from 'superjson'
import { z } from 'zod'

import {
  EnvProvider,
  FeatureContext,
  type EnvContextReturn,
} from '~/components/AppProviders'
import { DefaultFallback } from '~/components/ErrorBoundary'
import Suspense from '~/components/Suspense'
import { env } from '~/env.mjs'
import { LoginStateContext } from '~/features/auth'
import { type AppRouter } from '~/server/modules/_app'
import { withChromaticModes } from '~/stories/utils/chromatic'
import { viewport } from '~/stories/utils/viewports'
import { theme } from '~/theme'

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
})

const trpc = createTRPCReact<AppRouter>()

const StorybookEnvDecorator: Decorator = (story) => {
  const mockEnv: EnvContextReturn['env'] = merge(
    {
      NEXT_PUBLIC_APP_NAME: 'EduEDA',
      NEXT_PUBLIC_APP_VERSION: 'Storybook',
      NEXT_PUBLIC_ENABLE_SGID: false,
      NEXT_PUBLIC_ENABLE_STORAGE: false,
    },
    env,
  )
  return <EnvProvider env={mockEnv}>{story()}</EnvProvider>
}

const SetupDecorator: Decorator = (story) => {
  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    }),
  )
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '' })],
      transformer: superjson,
    }),
  )
  return (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <Suspense fallback={<Skeleton width="100vw" height="100vh" />}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {story()}
          </QueryClientProvider>
        </trpc.Provider>
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * To use this decorator, you need to pass in a `getLayout` function in the story parameters.
 * @example 
 * ```
  const meta: Meta<typeof ActivityAddPage> = {
    title: 'Pages/ActivityAddPage',
    component: ActivityAddPage,
    parameters: {
      getLayout: ActivityAddPage.getLayout,
    // ...
    },
  }
  ```
 */
const WithLayoutDecorator: Decorator = (Story, { parameters }) => {
  if (!parameters.getLayout) {
    return Story()
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return <>{parameters.getLayout(<Story />)}</>
}

export const MockFeatureFlagsDecorator: Decorator<Args> = (
  story,
  { parameters },
) => {
  const featureSchema = z
    .object({
      storage: z.boolean().default(false),
      sgid: z.boolean().default(false),
    })
    .default({})
  const features = useMemo(() => {
    return featureSchema.parse(parameters.features)
  }, [featureSchema, parameters.features])

  return (
    <FeatureContext.Provider value={features}>
      {story()}
    </FeatureContext.Provider>
  )
}

const LoginStateDecorator: Decorator<Args> = (story, { parameters }) => {
  const [hasLoginStateFlag, setLoginStateFlag] = useState(
    Boolean(parameters.loginState ?? true),
  )

  const setHasLoginStateFlag = useCallback(() => {
    setLoginStateFlag(true)
  }, [setLoginStateFlag])

  const removeLoginStateFlag = useCallback(() => {
    setLoginStateFlag(false)
  }, [setLoginStateFlag])

  return (
    <LoginStateContext.Provider
      value={{
        hasLoginStateFlag,
        removeLoginStateFlag,
        setHasLoginStateFlag,
      }}
    >
      {story()}
    </LoginStateContext.Provider>
  )
}

export const MockDateDecorator: Decorator<Args> = (story, { parameters }) => {
  mockdate.reset()

  if (!parameters.mockdate) {
    return story()
  }

  mockdate.set(parameters.mockdate)

  const mockedDate = format(parameters.mockdate, 'dd-mm-yyyy HH:mma')

  return (
    <Box>
      <Box
        pos="fixed"
        top={0}
        right={0}
        bg="white"
        p="0.25rem"
        fontSize="0.75rem"
        lineHeight={1}
        zIndex="docked"
      >
        Mocking date: {mockedDate}
      </Box>
      {story()}
    </Box>
  )
}

export const decorators: Decorator[] = [
  WithLayoutDecorator,
  StorybookEnvDecorator,
  MockFeatureFlagsDecorator,
  LoginStateDecorator,
  SetupDecorator,
  withThemeFromJSXProvider<ReactRenderer>({
    themes: {
      default: theme,
    },
    Provider: ThemeProvider,
  }),
  MockDateDecorator,
]

export const loaders: Loader[] = [mswLoader]

export const parameters: Parameters = {
  // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  layout: 'fullscreen',
  viewport,
  /**
   * If tablet view is needed, add it on a per-story basis.
   * @example
   * ```
   * export const SomeStory: Story = {
   *   parameters: {
   *     chromatic: withChromaticModes(["gsib", "desktop", "tablet"]),
   *   }
   * }
   * ```
   */
  chromatic: {
    ...withChromaticModes(['desktop']),
    prefersReducedMotion: 'reduce',
  },
}
