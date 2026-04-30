"use client";

import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";

const MantineAppProvider = ({ children }: { children: ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

export default MantineAppProvider;
