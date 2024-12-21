import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { Box, Flex, Select, Stack, Text } from '@chakra-ui/react'
import { Button, useIsMobile } from '@opengovsg/design-system-react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartData,
} from 'chart.js'
// Use type-only import
import Papa from 'papaparse'
import { Bar } from 'react-chartjs-2'

import { OgpLogo } from '~/components/Svg/OgpLogo'
import {
  AppPublicHeader,
  LandingSection,
  SectionBodyText,
  SectionHeadingText,
} from '~/features/landing/components'
import { SIGN_IN } from '~/lib/routes'
import {
  calculateStepSize,
  roundToNearestPowerOfTen,
} from './helpers/chartHelpers'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
interface TeacherDataRow {
  Year?: string
  'Age Group'?: string
  'Primary Total'?: string
  'Primary Female'?: string
  'Secondary Total'?: string
  'Secondary Female'?: string
  'Pre-University Total'?: string
  'Pre-University Female'?: string
  'Overall Total'?: string
  'Overall Female'?: string
}

type ChartDataType = ChartData<'bar', number[], string>

const LandingPage = () => {
  const isMobile = useIsMobile()
  const [chartData, setChartData] = useState<ChartDataType | null>(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/teachers_age_data_2019_2023.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const csvText = await response.text()
        const parsed = Papa.parse<TeacherDataRow>(csvText, { header: true })
        const data = parsed.data.map((row) => {
          const safeRow = row as TeacherDataRow

          const safeParse = (value: string | undefined): number => {
            return value && typeof value === 'string'
              ? parseInt(value.replace(/,/g, ''), 10)
              : 0
          }

          return {
            ...safeRow,
            'Primary Total': safeParse(safeRow['Primary Total']),
            'Primary Female': safeParse(safeRow['Primary Female']),
            'Secondary Total': safeParse(safeRow['Secondary Total']),
            'Secondary Female': safeParse(safeRow['Secondary Female']),
            'Pre-University Total': safeParse(safeRow['Pre-University Total']),
            'Pre-University Female': safeParse(
              safeRow['Pre-University Female'],
            ),
            'Overall Total': safeParse(safeRow['Overall Total']),
            'Overall Female': safeParse(safeRow['Overall Female']),
          }
        })

        const filteredData = data.filter((d) => {
          return (
            selectedAgeGroup === 'All' || d['Age Group'] === selectedAgeGroup
          )
        })

        const groupedData = filteredData.reduce(
          (acc, curr) => {
            const year = curr.Year || ''
            acc[year] = (acc[year] || 0) + (curr['Overall Total'] || 0)
            return acc
          },
          {} as Record<string, number>,
        )

        const labels = [...new Set(data.map((d) => d.Year || ''))]
        const values = labels.map((year) => groupedData[year] || 0)

        setChartData({
          labels,
          datasets: [
            {
              label:
                selectedAgeGroup === 'All'
                  ? 'All Age Groups'
                  : selectedAgeGroup,
              data: values,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        })
      } catch (error) {
        console.error('Error fetching or processing data:', error)
      }
    }

    void fetchData() // Explicitly mark as ignored
  }, [selectedAgeGroup])

  return (
    <>
      <AppPublicHeader />
      <LandingSection
        bg="base.canvas.brand-subtle"
        pt={{ base: '2rem', md: 0 }}
        px={0}
      >
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          spacing={{ base: '1.5rem', md: '3.125rem', lg: '7.5rem' }}
        >
          <Flex flexDir="column" flex={1}>
            <Text
              as="h1"
              textStyle={{
                base: 'responsive-display.heavy',
                md: 'responsive-display.heavy-480',
              }}
              color="base.content.strong"
            >
              Explore Educational Data with{' '}
              <Text as="span" color="interaction.main.default">
                EduEDA
              </Text>
            </Text>
            <SectionBodyText mt="1rem">
              Uncover insights, and empower decision-making through interactive
              visualizations
            </SectionBodyText>
            <Box mt="2.5rem">
              <Button isFullWidth={isMobile} as={NextLink} href={SIGN_IN}>
                Join waitlist
              </Button>
            </Box>
          </Flex>
        </Stack>
      </LandingSection>
      <LandingSection>
        <SectionHeadingText>Teacher Strength</SectionHeadingText>
        <SectionBodyText>
          How has the number of teachers changed from 2019 to 2023?
        </SectionBodyText>
        <Box mt="2rem" textAlign="center">
          <Text mb="1rem" fontWeight="bold">
            Select Age Group
          </Text>
          <Select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            width="200px"
            mx="auto"
            mb="2rem"
          >
            {[
              'All',
              '24 and below',
              '25-29',
              '30-34',
              '35-39',
              '40-44',
              '45-49',
              '50-54',
              '55 and above',
            ].map((ageGroup) => (
              <option key={ageGroup} value={ageGroup}>
                {ageGroup}
              </option>
            ))}
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
                    max:
                      chartData &&
                      chartData.datasets &&
                      chartData.datasets[0]?.data
                        ? roundToNearestPowerOfTen(
                            Math.max(...chartData.datasets[0].data),
                          )
                        : 0, // Default to 0 if data is undefined
                    ticks: {
                      stepSize:
                        chartData &&
                        chartData.datasets &&
                        chartData.datasets[0]?.data
                          ? calculateStepSize(
                              Math.max(...chartData.datasets[0].data),
                            )
                          : 10, // Default step size if data is undefined
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
          textStyle={{
            base: 'responsive-heading.heavy',
            md: 'responsive-heading.heavy-480',
          }}
          color="white"
          mt="2rem"
        >
          Share data or insights
        </Text>
        <Box mt="2rem">
          <Button as={NextLink} href={SIGN_IN}>
            Join waitlist
          </Button>
        </Box>
      </LandingSection>
    </>
  )
}

export default LandingPage
