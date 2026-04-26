export interface IJob {
  id: number;
  attributes: JobAttributes;
}

export interface JobAttributes {
  title: string;
  slug: string;
  releasedAt: string;
  endsAt: string;
  description: string;
  qualification: string | null;
  salaryAmount: number;
  remoteRate: number;

  salaryTimeUnit: {
    data: {
      id: number;
      attributes: {
        name: string;
      };
    } | null;
  };

  salaryCurrency: {
    data: {
      id: number;
      attributes: {
        name: string;
      };
    } | null;
  };

  companyProfile: {
    data: {
      id: number;
      attributes: {
        name: string;
        addressStreet: string;
        addressZip: string;
        addressCity: string;
        websiteUrl: string;
        logo: {
          data: any | null;
        };
      };
    } | null;
  };

  onlineAdProducts: {
    data: OnlineAdProduct[];
  };

  applicationMethod: "email" | "forward";
  applicationTarget: string;
  contactEmail: string;
  contactPhone: string;
}

export interface OnlineAdProduct {
  id: number;
  attributes: {
    region: string;
    name: string;
    portals: {
      data: Portal[];
    };
  };
}

export interface Portal {
  id: number;
  attributes: {
    slug: string;
    frontendId: number;
  };
}
