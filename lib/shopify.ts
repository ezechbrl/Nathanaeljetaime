import type { StorePlan } from "./store-schema";

const API_VERSION = "2025-10";

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function adminGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) throw new Error("SHOPIFY_STORE_DOMAIN et SHOPIFY_ADMIN_TOKEN doivent être définis.");

  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shopify-access-token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify a répondu ${res.status}`);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

type UserError = { field: string[] | null; message: string };

function assertNoUserErrors(errors: UserError[]) {
  if (errors.length) throw new Error(errors.map((e) => e.message).join("; "));
}

// Crée le produit (en brouillon) et la page "À propos" sur la boutique Shopify.
export async function publishStorePlan(plan: StorePlan) {
  const productData = await adminGraphQL<{
    productCreate: {
      product: { id: string; handle: string; variants: { nodes: { id: string }[] } } | null;
      userErrors: UserError[];
    };
  }>(
    `mutation ($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product { id handle variants(first: 1) { nodes { id } } }
        userErrors { field message }
      }
    }`,
    {
      product: {
        title: plan.product.title,
        descriptionHtml: plan.product.descriptionHtml,
        tags: plan.product.tags,
        status: "DRAFT",
        seo: { title: plan.product.seoTitle, description: plan.product.seoDescription },
      },
    },
  );
  assertNoUserErrors(productData.productCreate.userErrors);
  const product = productData.productCreate.product!;

  const variantId = product.variants.nodes[0]?.id;
  if (variantId && plan.product.price) {
    const priceData = await adminGraphQL<{ productVariantsBulkUpdate: { userErrors: UserError[] } }>(
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
        }
      }`,
      {
        productId: product.id,
        variants: [
          {
            id: variantId,
            price: plan.product.price,
            ...(plan.product.compareAtPrice ? { compareAtPrice: plan.product.compareAtPrice } : {}),
          },
        ],
      },
    );
    assertNoUserErrors(priceData.productVariantsBulkUpdate.userErrors);
  }

  const pageData = await adminGraphQL<{
    pageCreate: { page: { id: string; handle: string } | null; userErrors: UserError[] };
  }>(
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) { page { id handle } userErrors { field message } }
    }`,
    { page: { title: plan.aboutPage.title, body: plan.aboutPage.bodyHtml, isPublished: false } },
  );
  assertNoUserErrors(pageData.pageCreate.userErrors);

  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const productNumericId = product.id.split("/").pop();
  return {
    productAdminUrl: `https://${domain}/admin/products/${productNumericId}`,
    pageHandle: pageData.pageCreate.page?.handle ?? null,
  };
}
