import { SettingMenu } from '@components/admin/SettingMenu.js';
import Spinner from '@components/admin/Spinner.js';
import LogoUploader from '@components/admin/LogoUploader.js';
import ColorPaletteSelector from '@components/admin/ColorPaletteSelector.js';
import Area from '@components/common/Area.js';
import { EmailField } from '@components/common/form/EmailField.js';
import { Form, useFormContext } from '@components/common/form/Form.js';
import { InputField } from '@components/common/form/InputField.js';
import { SelectField } from '@components/common/form/SelectField.js';
import { TelField } from '@components/common/form/TelField.js';
import { TextareaField } from '@components/common/form/TextareaField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { Item } from '@components/common/ui/Item.js';
import { Skeleton } from '@components/common/ui/Skeleton.js';
import React, { useEffect } from 'react';
import { useQuery } from 'urql';

const ProvincesQuery = `
  query Province($countries: [String]) {
    provinces (countries: $countries) {
      code
      name
      countryCode
    }
  }
`;

const CountriesQuery = `
  query Country($countries: [String]) {
    countries (countries: $countries) {
      code
      name
    }
  }
`;

const Province: React.FC<{
  selectedCountry: string;
  selectedProvince: string;
  allowedCountries?: string[];
  fieldName?: string;
}> = ({
  selectedCountry = 'US',
  selectedProvince,
  allowedCountries = [],
  fieldName = 'storeProvince'
}) => {
  const { setValue } = useFormContext();

  const [result] = useQuery({
    query: ProvincesQuery,
    variables: { countries: allowedCountries }
  });
  const { data, fetching, error } = result;
  useEffect(() => {
    if (fetching || !data) return;
    const provinces = data.provinces.filter(
      (p) => p.countryCode === selectedCountry
    );
    if (provinces.every((p) => p.code !== selectedProvince)) {
      setValue(fieldName, '');
    }
  }, [selectedCountry, fetching]);
  if (fetching)
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-1/2 h-5 rounded-md" />
        <Skeleton className="w-full h-9 rounded-md" />
      </div>
    );
  if (error) {
    return <p className="text-destructive">{error.message}</p>;
  }
  const provinces = data.provinces.filter(
    (p) => p.countryCode === selectedCountry
  );
  if (!provinces.length) {
    return null;
  }

  return (
    <div>
      <SelectField
        id="storeProvince"
        defaultValue={selectedProvince}
        name={fieldName}
        label="Province"
        placeholder="Province"
        required
        options={provinces.map((p) => ({ value: p.code, label: p.name }))}
      />
    </div>
  );
};

const Country: React.FC<{
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  allowedCountries?: string[];
  fieldName?: string;
}> = ({
  selectedCountry,
  setSelectedCountry,
  allowedCountries = [],
  fieldName = 'storeCountry'
}) => {
  const onChange = (value: string) => {
    setSelectedCountry(value);
  };
  const [result] = useQuery({
    query: CountriesQuery,
    variables: { countries: allowedCountries }
  });

  const { data, fetching, error } = result;

  if (fetching)
    return (
      <Item variant={'outline'}>
        <Spinner width={'2rem'} height={'2rem'} />
      </Item>
    );
  if (error) {
    return <p className="text-destructive">{error.message}</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <SelectField
        defaultValue={selectedCountry}
        name={fieldName}
        label="Country"
        placeholder="Country"
        onChange={onChange}
        required
        options={data.countries.map((c) => ({ value: c.code, label: c.name }))}
      />
    </div>
  );
};

const StorePhoneNumber: React.FC<{ storePhoneNumber: string }> = ({
  storePhoneNumber
}) => {
  return (
    <div>
      <TelField
        name="storePhoneNumber"
        label="Store Phone Number"
        placeholder="Store Phone Number"
        defaultValue={storePhoneNumber}
      />
    </div>
  );
};

const StoreEmail: React.FC<{ storeEmail: string }> = ({ storeEmail }) => {
  return (
    <div>
      <EmailField
        name="storeEmail"
        label="Store Email"
        placeholder="Store Email"
        defaultValue={storeEmail}
      />
    </div>
  );
};

interface StoreSettingProps {
  saveSettingApi: string;
  setting: {
    storeName: string;
    storeDescription: string;
    storePhoneNumber: string;
    storeEmail: string;
    storeCountry: string;
    storeAddress: string;
    storeCity: string;
    storeProvince: string;
    storePostalCode: string;
    // Configuración de marca — Fase 5.4
    storeLogo?: string;
    storeLogoWidth?: number;
    storeLogoHeight?: number;
    storePrimaryColor?: string;
    storeCopyright?: string;
  };
}

export default function StoreSetting({
  saveSettingApi,
  setting: {
    storeName,
    storeDescription,
    storePhoneNumber,
    storeEmail,
    storeCountry,
    storeAddress,
    storeCity,
    storeProvince,
    storePostalCode,
    // Campos de marca
    storeLogo,
    storeLogoWidth,
    storeLogoHeight,
    storePrimaryColor,
    storeCopyright
  }
}: StoreSettingProps) {
  const [selectedCountry, setSelectedCountry] = React.useState(() => {
    const country = storeCountry;
    if (!country) {
      return 'US';
    } else {
      return country;
    }
  });

  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-5 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4">
          <Form method="POST" id="storeSetting" action={saveSettingApi}>
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>
                  Configure your store information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Area
                  id="storeInfoSetting"
                  className="space-y-3"
                  coreComponents={[
                    {
                      component: {
                        default: (
                          <InputField
                            name="storeName"
                            label="Store Name"
                            required
                            placeholder="Store Name"
                            defaultValue={storeName}
                          />
                        )
                      },
                      sortOrder: 10
                    },
                    {
                      component: {
                        default: (
                          <TextareaField
                            name="storeDescription"
                            label="Store Description"
                            placeholder="Store Description"
                            defaultValue={storeDescription}
                            required
                          />
                        )
                      },
                      sortOrder: 20
                    }
                  ]}
                />
              </CardContent>
              <CardContent className="pt-3 border-t border-border">
                <CardTitle>Contact Information</CardTitle>
                <Area
                  id="storeContactSetting"
                  coreComponents={[
                    {
                      component: {
                        default: StorePhoneNumber
                      },
                      props: {
                        storePhoneNumber
                      },
                      sortOrder: 10
                    },
                    {
                      component: {
                        default: StoreEmail
                      },
                      props: {
                        storeEmail
                      },
                      sortOrder: 20
                    }
                  ]}
                  className="grid grid-cols-2 gap-5 mt-5"
                />
              </CardContent>
              <CardContent className="pt-3 border-t border-border">
                <CardTitle>Address</CardTitle>
                <div className="space-y-3">
                  <Country
                    selectedCountry={storeCountry}
                    setSelectedCountry={setSelectedCountry}
                  />
                  <InputField
                    name="storeAddress"
                    label="Address"
                    defaultValue={storeAddress}
                    placeholder="Store Address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-5 mt-5">
                  <div>
                    <InputField
                      name="storeCity"
                      label="City"
                      defaultValue={storeCity}
                      placeholder="City"
                    />
                  </div>
                  <Province
                    selectedProvince={storeProvince}
                    selectedCountry={selectedCountry}
                  />
                  <div>
                    <InputField
                      name="storePostalCode"
                      label="Postal Code"
                      defaultValue={storePostalCode}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </CardContent>
              {/* ── Sección de Marca (Fase 5.4) ── */}
              <CardContent className="pt-3 border-t border-border space-y-6">
                <CardTitle>Marca y Apariencia</CardTitle>
                <CardDescription>
                  Personaliza el logo, colores y pie de página de tu tienda.
                </CardDescription>

                {/* — Logo (carga desde archivo local) — */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Logo de la Tienda</h3>
                  <LogoUploader
                    currentLogo={storeLogo}
                    currentWidth={storeLogoWidth ?? 160}
                    currentHeight={storeLogoHeight ?? 50}
                  />
                </div>

                {/* — Paleta de Colores — */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Colores de la Tienda</h3>
                  <ColorPaletteSelector
                    currentColors={{
                      primary: storePrimaryColor || '#1e40af'
                    }}
                  />
                </div>

                {/* — Copyright personalizable — */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Copyright del Footer</h3>
                  <InputField
                    name="storeCopyright"
                    label=""
                    placeholder="© 2025 Mi Tienda. Todos los derechos reservados."
                    defaultValue={storeCopyright || ''}
                  />
                  <p className="text-muted-foreground text-xs">
                    El copyright de BridgeShop y del creador siempre se muestra de forma fija.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    saveSettingApi: url(routeId: "saveSetting")
    setting {
      storeName
      storeDescription
      storeTimeZone
      storePhoneNumber
      storeEmail
      storeCountry
      storeAddress
      storeCity
      storeProvince
      storePostalCode
      # Campos de marca — Fase 5.4
      storeLogo
      storeLogoWidth
      storeLogoHeight
      storePrimaryColor
      storeCopyright
    }
  }
`;
