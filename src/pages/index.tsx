import Image from 'next/image'
import NextLink from 'next/link'
import { roundToNearestPowerOfTen, calculateStepSize } from './helpers/chartHelpers';
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
      try {
        const response = await fetch('/data/teachers_age_data_2019_2023.csv'); // Corrected path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        const data = parsed.data.map((row) => {
          // Helper function to safely parse numbers
          const safeParse = (value) => {
            return value && typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : 0;
          };
  
          // Remove commas and convert numeric columns to numbers
          return {
            ...row,
            'Primary Total': safeParse(row['Primary Total']),
            'Primary Female': safeParse(row['Primary Female']),
            'Secondary Total': safeParse(row['Secondary Total']),
            'Secondary Female': safeParse(row['Secondary Female']),
            'Pre-University Total': safeParse(row['Pre-University Total']),
            'Pre-University Female': safeParse(row['Pre-University Female']),
            'Overall Total': safeParse(row['Overall Total']),
            'Overall Female': safeParse(row['Overall Female']),
          };
        });
  
        console.log("Parsed Data:", data); // Debugging output
  
        // Rest of the processing logic
        const filteredData = data.filter((d) => {
          return selectedAgeGroup === 'All' || d['Age Group'] === selectedAgeGroup;
        });
  
        const groupedData = filteredData.reduce((acc, curr) => {
          const year = curr.Year;
          acc[year] = (acc[year] || 0) + curr['Overall Total'];
          return acc;
        }, {});
  
        const labels = [...new Set(data.map((d) => d.Year))];
        const values = labels.map((year) => groupedData[year] || 0);
  
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
        });
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      }
    };
  
    fetchData();
  }, [selectedAgeGroup]);
  
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
              Uncover insights, and empower decision-making through interactive visualizations
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
        <SectionBodyText>How has the number of teachers changed from 2019 to 2023?</SectionBodyText>
 <Box
  mt="2rem"
  textAlign="center"
>
  <Text mb="1rem" fontWeight="bold">Select Age Group</Text>
  <Select
    value={selectedAgeGroup}
    onChange={(e) => setSelectedAgeGroup(e.target.value)}
    width="200px"
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
              max: roundToNearestPowerOfTen(Math.max(...chartData.datasets[0].data)),
              ticks: {
                stepSize: calculateStepSize(Math.max(...chartData.datasets[0].data)),
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