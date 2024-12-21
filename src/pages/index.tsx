import Image from 'next/image'
import NextLink from 'next/link'
import { Box, Flex, Stack, Text, Select } from '@chakra-ui/react'
import { Button, useIsMobile } from '@opengovsg/design-system-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'

import { OgpLogo } from '~/components/Svg/OgpLogo'
import {
  AppPublicHeader,
  LandingSection,
  SectionBodyText,
  SectionHeadingText,
} from '~/features/landing/components'
import { SIGN_IN } from '~/lib/routes'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const LandingPage = () => {
  const isMobile = useIsMobile()
  const [chartData, setChartData] = useState<any>(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/teachers_age_data_2019_2023_cleaned.csv')
      const csvText = await response.text()
      const parsed = Papa.parse(csvText, { header: true })
      const data = parsed.data

      // Convert data to chart.js format
      const filteredData = data.filter((d: any) => {
        return selectedAgeGroup === 'All' || d['Age Group'] === selectedAgeGroup
      })

      const groupedData = filteredData.reduce((acc: any, curr: any) => {
        const year = curr.Year
        acc[year] = (acc[year] || 0) + parseInt(curr['Overall Total'], 10)
        return acc
      }, {})

      const labels = [...new Set(data.map((d: any) => d.Year))]
      const values = labels.map((year) => groupedData[year] || 0)

      setChartData({
        labels,
        datasets: [
          {
            label: selectedAgeGroup === 'All' ? 'All Age Groups' : selectedAgeGroup,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      })
    }

    fetchData()
  }, [selectedAgeGroup])

  return (
    <>
      <AppPublicHeader />
      <LandingSection bg="base.canvas.brand-subtle" pt={{ base: '2rem', md: 0 }} px={0}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          spacing={{ base: '1.5rem', md: '3.125rem', lg: '7.5rem' }}
        >
          <Flex flexDir="column" flex={1}>
            <Text
              as="h1"
              textStyle={{ base: 'responsive-display.heavy', md: 'responsive-display.heavy-480' }}
              color="base.content.strong"
            >
              Explore Educational Data with{' '}
              <Text as="span" color="interaction.main.default">
                EduEDA
              </Text>
            </Text>
            <SectionBodyText mt="1rem">
              EduEDA is your go-to platform for exploring education data, uncovering insights, and empowering decision-making through interactive visualizations.
            </SectionBodyText>
            <Box mt="2.5rem">
              <Button isFullWidth={isMobile} as={NextLink} href={SIGN_IN}>
                Start Exploring
              </Button>
            </Box>
          </Flex>
        </Stack>
      </LandingSection>
      <LandingSection>
        <SectionHeadingText>Interactive Visualizations</SectionHeadingText>
        <Box mt="2rem" textAlign="center">
          <Text mb="1rem" fontWeight="bold">Select Age Group:</Text>
          <Select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            width="300px"
            mx="auto"
            mb="2rem"
          >
            {['All', '24 and below', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55 and above'].map(
              (ageGroup) => (
                <option key={ageGroup} value={ageGroup}>
                  {ageGroup}
                </option>
              )
            )}
          </Select>
          {chartData ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: {
                    display: true,
                    text: `Teachers' Overall Numbers (${selectedAgeGroup})`,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Year',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    max: 5000,
                    ticks: {
                      stepSize: 1000,
                    },
                    title: {
                      display: true,
                      text: 'Number of Teachers',
                    },
                  },
                },
              }}
            />
          ) : (
            <Text>Loading chart...</Text>
          )}
        </Box>
      </LandingSection>
      <LandingSection bg="base.content.strong" align="center">
        <OgpLogo aria-hidden w="3.5rem" h="3.5rem" color="blue.500" />
        <Text
          textAlign="center"
          textStyle={{ base: 'responsive-heading.heavy', md: 'responsive-heading.heavy-480' }}
          color="white"
          mt="2rem"
        >
          Start uncovering insights in education data now.
        </Text>
        <Box mt="2rem">
          <Button as={NextLink} href={SIGN_IN}>
            Get started
          </Button>
        </Box>
      </LandingSection>
    </>
  )
}

export default LandingPage