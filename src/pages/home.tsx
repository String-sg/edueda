import Link from 'next/link'
import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

import { APP_GRID_COLUMN, APP_PX } from '~/constants/layouts'
import { StarterKitSvgr } from '~/features/home/components/StarterKitSvgr'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Home: NextPageWithLayout = () => {
  return (
    <AppGrid flex={1} bg="white" px={APP_PX} textAlign="center">
      <Flex py="3rem" gridColumn={APP_GRID_COLUMN} justify="center" my="auto">
        <Stack align="center" gap="1.25rem">
          <Text textStyle="responsive-display.heavy-1280" as="h1">
            You are on the waitlist for {' '}
            <Text as="span" color="interaction.main.default">
              EduEDA
            </Text>
          </Text>
          <Text textStyle="body-1">
            You will receive an email once we have more features/releases. Check
            out our repositories:
            <Link
              href="https://github.com/String-sg/education-digest-eda"
              isExternal
            >
              education raw data
            </Link>
            and
            <Link href="https://github.com/String-sg/eduEDA" isExternal>
              code for this web-application
            </Link>
            .
          </Text>

          <Button
            as={Link}
            href="https://string.beta.gov.sg"
            target="_blank"
          >
            See other String products
          </Button>
          <StarterKitSvgr />
        </Stack>
      </Flex>
    </AppGrid>
  )
}

Home.getLayout = AdminLayout

export default Home
