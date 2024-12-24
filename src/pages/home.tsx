import Link from 'next/link'
import { useState } from 'react'
import {
  Flex,
  Stack,
  Text,
  Button,
  Input,
  Select,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'

import { APP_GRID_COLUMN, APP_PX } from '~/constants/layouts'
import { StarterKitSvgr } from '~/features/home/components/StarterKitSvgr'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Home: NextPageWithLayout = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [birthdays, setBirthdays] = useState([])
  const [filter, setFilter] = useState('')

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCsvFile(file)
  }

  // Submit the CSV file to the backend
  const handleUpload = async () => {
    if (!csvFile) {
      alert('Please upload a CSV file')
      return
    }

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      const res = await fetch('/api/upload-student-birthdays', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('CSV uploaded successfully!')
        setCsvFile(null) // Reset the file input
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to upload the file.')
    }
  }

  // Fetch birthdays based on the selected filter
  const fetchBirthdays = async () => {
    try {
      const res = await fetch(`/api/get-student-birthdays?filter=${filter}`)
      const data = await res.json()
      setBirthdays(data)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch birthdays.')
    }
  }

  // Handle delete/purge data
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all birthday data?')) return

    try {
      const res = await fetch('/api/delete-student-birthdays', { method: 'DELETE' })
      if (res.ok) {
        alert('All data deleted successfully!')
        setBirthdays([]) // Reset the displayed data
      } else {
        alert('Failed to delete data.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete data.')
    }
  }

  return (
    <AppGrid flex={1} bg="white" px={APP_PX} textAlign="center">
      {/* Existing Waitlist Section */}
      <Flex py="3rem" gridColumn={APP_GRID_COLUMN} justify="center" my="auto">
        <Stack align="center" gap="1.25rem">
          <Text textStyle="responsive-display.heavy-1280" as="h1">
            You are on the waitlist for{' '}
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

          <Button as={Link} href="https://string.beta.gov.sg" target="_blank">
            See other String products
          </Button>
          <StarterKitSvgr />
        </Stack>
      </Flex>

      {/* New Student Birthday Management Section */}
      <Box bg="gray.100" p={6} borderRadius="md" mt={8}>
        <Text as="h2" fontSize="xl" fontWeight="bold" mb={4}>
          Manage Student Birthdays (Beta)
        </Text>

        {/* Upload CSV */}
        <Stack spacing={4}>
          <Input type="file" onChange={handleFileUpload} />
          <Button colorScheme="blue" onClick={handleUpload}>
            Upload CSV
          </Button>

          {/* Filter Birthdays */}
          <Select
            placeholder="Select a filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </Select>
          <Button colorScheme="green" onClick={fetchBirthdays}>
            View Birthdays
          </Button>

          {/* Display Birthdays */}
          {birthdays.length > 0 && (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Class</Th>
                  <Th>Birthday</Th>
                </Tr>
              </Thead>
              <Tbody>
                {birthdays.map((student, index) => (
                  <Tr key={index}>
                    <Td>{student.name}</Td>
                    <Td>{student.class}</Td>
                    <Td>{`${student.birthday_day}/${student.birthday_month}`}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Delete Data */}
          <Button colorScheme="red" onClick={handleDelete}>
            Delete All Data
          </Button>
        </Stack>
      </Box>
    </AppGrid>
  )
}

Home.getLayout = AdminLayout

export default Home
