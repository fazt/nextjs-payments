// import { Stripe } from "stripe";
// import { ButtonSubcription } from "./button-subscription";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export const dynamic = "force-dynamic";

// export default async function Page() {
//   const result = await stripe.prices.list({});

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <div className="grid grid-cols-4 gap-x-2">
//         {result.data.map((price) => (
//           <ButtonSubcription key={price.id} price={price} />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];
const tiers = [
  {
    name: "Hobby",
    id: "tier-hobby",
    href: "#",
    price: { monthly: "$15", annually: "$144" },
    description: "The essentials to provide your best work for clients.",
    features: ["5 products", "Up to 1,000 subscribers", "Basic analytics"],
    mostPopular: false,
    price_id: "",
  },
  {
    name: "Freelancer",
    id: "tier-freelancer",
    href: "#",
    price: { monthly: "$30", annually: "$288" },
    description: "The essentials to provide your best work for clients.",
    features: [
      "5 products",
      "Up to 1,000 subscribers",
      "Basic analytics",
      "48-hour support response time",
    ],
    mostPopular: false,
  },
  {
    name: "Startup",
    id: "tier-startup",
    href: "#",
    price: { monthly: "$60", annually: "$576" },
    description: "A plan that scales with your rapidly growing business.",
    features: [
      "25 products",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
      "Marketing automations",
    ],
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    price: { monthly: "$40", annually: "$350" },
    description: "Dedicated support and infrastructure for your company.",
    features: [
      "Unlimited products",
      "Unlimited subscribers",
      "Advanced analytics",
      "1-hour, dedicated support response time",
      "Marketing automations",
      "Custom reporting tools",
    ],
    mostPopular: false,
    price_id_month: "price_1PCrGWGePIlKioDCTF4h0fpO",
    price_id_year: "price_1PCrJOGePIlKioDCq1udOHkn",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for teams of&nbsp;all&nbsp;sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose an affordable plan that’s packed with the best features for
          engaging your audience, creating customer loyalty, and driving sales.
        </p>
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">
              Payment frequency
            </RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  classNames(
                    checked ? "bg-indigo-600 text-white" : "text-gray-500",
                    "cursor-pointer rounded-full px-2.5 py-1"
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? "ring-2 ring-indigo-600"
                  : "ring-1 ring-gray-200",
                "rounded-3xl p-8"
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? "text-indigo-600" : "text-gray-900",
                  "text-lg font-semibold leading-8"
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price[frequency.value]}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {frequency.priceSuffix}
                </span>
              </p>
              <a
                // href={tier.href}
                onClick={async () => {
                  const res = await fetch("/api/checkout/subscription", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      priceId:
                        frequency.value === "monthly"
                          ? tier.price_id_month
                          : tier.price_id_year,
                    }),
                  });
                  console.log(res);

                  const data = await res.json();

                  window.location.href = data.url;
                }}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                    : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                  "mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                Buy plan
              </a>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
