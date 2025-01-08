import { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { Attachment } from '@opengovsg/design-system-react'

import { APP_GRID_COLUMN, APP_PX } from '~/constants/layouts'
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

  const handleUpload = async () => {
    if (!csvFile) {
      alert('Please upload a CSV file')
      return
    }

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      const res = await fetch('/api/birthdays/upload', {
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

  const fetchBirthdays = async () => {
    try {
      const res = await fetch(`/api/birthdays/get?filter=${filter}`)
      const data = await res.json()
      setBirthdays(data)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch birthdays.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all birthday data?')) return

    try {
      const res = await fetch('/api/birthdays/delete', { method: 'DELETE' })
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
    <AppGrid
      flex={1}
      bg="white"
      px={APP_PX}
      textAlign="center"
      templateColumns="1fr" // Ensure single-column layout
    >
      {/* Introduction Section */}
      <Box gridColumn="1 / -1" py="3rem">
        <Stack align="center" gap="1.25rem">
          <Text textStyle="responsive-display.heavy-1280" as="h1">
            Welcome to{' '}
            <Text as="span" color="interaction.main.default">
              EduEDA
            </Text>
          </Text>
          <Text textStyle="body-1">
            Start with an introductory tool:{' '}
            <b>Birthdays</b> or explore other data. <br></br>
          </Text>
        </Stack>
      </Box>

      {/* Birthday Management Section */}
      <Box
        bg="gray.100"
        p={6}
        borderRadius="md"
        gridColumn="1 / -1"
        maxWidth="200rem" // Correct property and value
        mx="auto" // Center the box horizontally
      >
        <Text as="h2" fontSize="xl" fontWeight="bold" mb={4}>
        🎉 Manage Student Birthdays
        </Text>
        <Text textStyle="body-1">
            You can opt in to receive email notifications to facilitate
            planning, or import this into your calendar of choice.
          </Text>
          <Text textStyle="body-1">
            <b>You own this data</b> and can delete it anytime.
          </Text>
        <Stack spacing={4}>
          {/* Upload CSV */}
          <Attachment
            onFilesSelected={handleFileUpload}
            accept="text/csv"
            hint="Upload a CSV file with columns: name, class, birthday (DD/MM)"
            isRequired
          />
          {/* Filter Birthdays */}
          <Select
            placeholder="Select a filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="today">Today</option>
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

      {/* Advanced Features Section */}
      <Box gridColumn="1 / -1" mt={8}>
        <Text textStyle="body-1" color="gray.600">
          Interested to contribute?<br></br>
          <Link
            href="https://github.com/String-sg/eduEDA"
            isExternal
            color="interaction.main.default"
          >
            See GitHub
          </Link>{' '}
        </Text>
      </Box>
    </AppGrid>
  )
}

Home.getLayout = AdminLayout

export default Home
