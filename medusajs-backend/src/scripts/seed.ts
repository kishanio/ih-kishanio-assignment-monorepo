import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["IN"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "IH Assignment Store",
  });

  if (!defaultSalesChannel.length) {
    // create the IH Assignment Store
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "IH Assignment Store",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "inr",
            is_default: true,
          },
        ],
        default_region_id: region.id,
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Jammu & Kashmir Warehouse",
          address: {
            country_code: "IN",
            address_1: "Entire State",
          },
        },
        {
          name: "Himachal Pradesh Warehouse",
          address: {
            country_code: "IN",
            address_1: "Shimla Valley",
          },
        },
      ],
    },
  });

  await Promise.all(
    stockLocationResult.map(async (stockLocation) => {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
          id: stockLocation.id,
          add: [defaultSalesChannel[0].id],
        },
      });
    })
  );

  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "IH Assignment Store API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Jammu & Kashmir Treks",
          is_active: true,
        },
        {
          name: "Himachal Pradesh Treks",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Tulian Lake Trek",
          subtitle: "The Hidden Lake in the High Lands of Jammu & Kashmir",

          category_ids: [
            categoryResult.find((cat) => cat.name === "Jammu & Kashmir Treks")!
              .id,
          ],
          description:
            "Kashmir treks are synonymous with lakes and meadows. With treks like the Kashmir Great Lakes, the Tarsar Marsar, the Bodhpatri, and the Nafran Valley already in the picture, it’s hard for any trek to match them. Yet, we have another terrific trek in Kashmir—the Tulian Lake trek—that does equal justice to these great treks. Along with stunning meadows and an alpine lake, the Tulian Lake trek has something that our other treks in Kashmir do not: the famous flora of Kashmir.",
          handle: "tulian-lake",
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://images.prismic.io/indiahike/205aa3c5-b327-4032-9918-8456fdbd3442_Tulian+Lake_Amit+Fatnani_Indiahikes21.jpg?w=1600&h=1200&q=50&org_if_sml=1",
            },
            {
              url: "https://images.prismic.io/indiahike/Z-ECundAxsiBvyRU_TulianLake_jothiranjan-1-.jpg?w=1600&h=900&q=50&org_if_sml=1",
            },
            {
              url: "https://images.prismic.io/indiahike/ee3541ab-6925-4d39-bf97-ff86727dc05f_Tulian+Lake_Lucas+Bragagnollo_Indiahikes+%2816%29.jpg?w=1600&h=1067&q=50&org_if_sml=1",
            },
          ],
          options: [
            {
              title: "Year",
              values: ["2025", "2026"],
            },
            {
              title: "Month",
              values: ["July", "August", "September"],
            },
          ],
          variants: [
            {
              title: "Pilot Batch - 28th July to 1st August - 2025",
              sku: "jnk-tul-2025-07-01",
              options: {
                Month: "July",
                Year: "2025",
              },
              prices: [
                {
                  amount: 18500,
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  logger.info("Finished seeding product data.");

  const { data: product1InventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // loops through the inventoryItem.variants and create inventoryLevels for each variants at J&K warehouse
  const product1InventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of product1InventoryItems) {
    const inventoryLevel: CreateInventoryLevelInput = {
      location_id: stockLocationResult.find(
        (location) => location.name === "Jammu & Kashmir Warehouse"
      )!.id,
      stocked_quantity: 5,
      inventory_item_id: inventoryItem.id,
    };
    product1InventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: product1InventoryLevels,
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Rupin Pass Trek",
          subtitle: "A surprise in scenery every hour",

          category_ids: [
            categoryResult.find((cat) => cat.name === "Himachal Pradesh Treks")!
              .id,
          ],
          description:
            "On the Rupin Pass trek, there is something different waiting for you every hour. We never see sceneries change so dramatically and so quickly on any other trek. No two sections on the Rupin Pass Trek feel the same. Yet, you are constantly in awe. Surprises start right from the drive ahead of Rohru. Unpaved roads through forests open suddenly into expansive grasslands of the Chainsheel Valley. The drive itself is like doing a trek in fast-forward. You experience a rhododendron forest, then pop into expansive meadows while climbing to a height of 11,000 ft.",
          handle: "rupin-pass",
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://images.prismic.io/indiahike/Zersq3Uurf2G3Nar_Rupinpass_RP_Sumitsadhu_Forestsection_Junemonth_Viewfromjiskunvillage_.jpg?w=1600&h=1034&q=50&org_if_sml=1",
            },
            {
              url: "https://images.prismic.io/indiahike/d70e9463-546a-49a1-a98a-f5910ddaad8d_October+-+Rupin+Pass+-+Sushrut+Sardesai+-+Golden+Sunset+at+Dhanderas+Thatch.jpg?w=1600&h=1065&q=50&org_if_sml=1",
            },
            {
              url: "https://images.prismic.io/indiahike/ZersxXUurf2G3Na8_RupinPass_RP_Jothiranjan_Trekkersontrail_waytoSaruwasThatch_Vshapedvalley_valleysection_Rupinriver_-11-.jpg?w=1600&h=1067&q=50&org_if_sml=1",
            },
          ],
          options: [
            {
              title: "Year",
              values: ["2025", "2026","2027"],
            },
            {
              title: "Month",
              values: ["October", "May", "September", "June"],
            },
          ],
          variants: [
            {
              title: "5th September to 21st September - 2025",
              sku: "hp-rupin-2025-08-01",
              options: {
                Month: "September",
                Year: "2025",
              },
              prices: [
                {
                  amount: 16750,
                  currency_code: "inr",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });


  const { data: product2InventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "variants.*"],
  });

  // loops through the inventoryItem.variants and create inventoryLevels for each variants at J&K warehouse
  const product2InventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of product2InventoryItems) {
    const inventoryLevel: CreateInventoryLevelInput = {
      location_id: stockLocationResult.find(
        (location) => location.name === "Himachal Pradesh Warehouse"
      )!.id,
      stocked_quantity: 5,
      inventory_item_id: inventoryItem.id,
    };
    product2InventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: product2InventoryLevels,
    },
  });
}
