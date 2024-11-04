export type SectionContent = {
  section_id: string;
  heading: string;
  image: string;
  text: string;
  image_alt_text: string;
};

export type BlogEntry = {
  name: string;
  description: string;
  short_description: string;
  tags: string[];
  created_at: string;
  banner: string;
  banner_alt_text: string;
  section_ids: Array<"intro" | string>;
  intro: {
    section_id: string;
    heading: string;
    text: string;
  };
  sections: SectionContent[];
};

export type BlogsDataType = {
  ids: string[];
  entries: Record<string, BlogEntry>;
};


export type UserAssetOverview = {
  total_lent: bigint,
  total_borrowed: bigint,
  interest_earned: bigint,
  available_balance: bigint
};


export type UserAsset = {
  token_address: string,
  total_lent: bigint,
  total_borrowed: bigint,
  interest_earned: bigint,
  available_balance: bigint
};


export type TotalAssetsOverviewDisplay = {
  id: "available_balance" | "total_lent" | "total_borrowed" | "interest_earned";
  label: string;
  value: string;
  info?: string; // Optional for the info icon if needed
}