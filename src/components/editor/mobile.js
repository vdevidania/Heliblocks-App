import React from "react";
import Settings from "./settings";
import Title from "./title";
import Save from "./save";
import { CssEditor, HtmlEditor } from "./codeEditors";
import ScreenPreview from "./screenPreview";
import Logo from "components/logo";
import { UserMenu } from "components/menus";

import {
  Box,
  Flex,
  Tabs,
  Grid,
  TabPanel,
  TabPanels,
  TabList,
  Tab
} from "@chakra-ui/core";

const tabStyled = {
  borderTopWidth: "3px",
  borderColor: "white",
  fontSize: "sm",
  paddingX: [2, 6],
  _selected: { color: "primary.500", borderColor: "primary.500" }
};

const MobileEditor = () => {
  return (
    <Grid h="100vh" templateRows="56px 1fr" data-testid="mobile-editor">
      <Box borderBottomWidth="1px" px="2">
        <Flex height="55px" justifyContent="space-between" alignItems="center">
          <Logo narrow />
          <Title />
          <UserMenu />
        </Flex>
      </Box>

      <Tabs variant="unstyled" d="flex" flexDir="column">
        <TabPanels flexGrow="1">
          <TabPanel h="100%">
            <HtmlEditor />
          </TabPanel>
          <TabPanel h="100%">
            <CssEditor />
          </TabPanel>
          <TabPanel h="100%">
            <ScreenPreview />
          </TabPanel>
        </TabPanels>
        <Flex justifyContent="space-between" borderTopWidth="1px">
          <TabList>
            <Tab {...tabStyled}>HMTL</Tab>
            <Tab {...tabStyled}>CSS</Tab>
            <Tab {...tabStyled}>Preview</Tab>
          </TabList>
          <Flex p="2" justifyContent="space-between" flexGrow="1">
            <Box ml="auto">
              <Settings size="sm" mr="3" variant="link" />
              <Save />
            </Box>
          </Flex>
        </Flex>
      </Tabs>
    </Grid>
  );
};

export default MobileEditor;
