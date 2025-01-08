import Link from 'next/link'
import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button, Attachment } from '@opengovsg/design-system-react' // Added import for Attachment

import { APP_GRID_COLUMN, APP_PX } from '~/constants/layouts'
import { StarterKitSvgr } from '~/features/home/components/StarterKitSvgr'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import {ChangeEvent} from 'react'; // Added import for ChangeEvent


const Home: NextPageWithLayout = () => {
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    //Existing or new implementation for file upload handling.
    console.log("Files selected:", e.target.files);
  };

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
          {/* Upload CSV */}
          <Attachment
            onChange={handleFileUpload} // Corrected prop name
            accept="text/csv"
            hint="Upload a CSV file with columns: name, class, birthday (DD/MM)"
            isRequired
          />
        </Stack>
      </Flex>
    </AppGrid>
  )
}

Home.getLayout = AdminLayout

export default Home