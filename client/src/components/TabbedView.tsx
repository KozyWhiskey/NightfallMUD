    // client/src/components/TabbedView.tsx
    import { Tabs, Box } from '@chakra-ui/react';
import { HiChartBar, HiShieldCheck, HiBriefcase, HiBookOpen, HiSparkles, HiLightningBolt } from 'react-icons/hi';

    interface TabItem {
      label: string;
      content: React.ReactNode;
      icon?: React.ReactNode;
    }

    interface TabbedViewProps {
      tabs: TabItem[];
    }

    // Icon mapping for different tab types
const getIconForTab = (label: string) => {
  switch (label.toLowerCase()) {
    case 'attributes':
      return <HiChartBar size={16} />;
    case 'equipped':
      return <HiShieldCheck size={16} />;
    case 'backpack':
      return <HiBriefcase size={16} />;
    case 'quests':
      return <HiBookOpen size={16} />;
    case 'spells':
      return <HiSparkles size={16} />;
    case 'abilities':
      return <HiLightningBolt size={16} />;
    default:
      return null;
  }
};

    export function TabbedView({ tabs }: TabbedViewProps) {
      return (
        <Box
          bg="gray.800"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
          overflow="hidden"
          flex="1"
        >
          <Tabs.Root
            defaultValue={tabs[0]?.label}
            variant="plain"
            colorPalette="gray"
            size="sm"
          >
            <Tabs.List
              bg="gray.900"
              borderBottom="1px solid"
              borderColor="gray.700"
              p="1"
              gap="1"
            >
              {tabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.label}
                  value={tab.label}
                  color="gray.400"
                  _selected={{
                    color: "gray.100",
                    bg: "gray.800"
                  }}
                  _hover={{
                    color: "gray.100",
                    bg: "gray.700"
                  }}
                  borderRadius="md"
                  px="3"
                  py="2"
                  fontSize="0.9em"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  gap="2"
                >
                  {getIconForTab(tab.label)}
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Content
                key={tab.label}
                value={tab.label}
                p="0"
                bg="transparent"
                h="100%"
                overflow="hidden"
              >
                {tab.content}
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Box>
      );
    }
    