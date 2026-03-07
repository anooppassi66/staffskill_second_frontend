import React from 'react'
import Select, { SingleValue, StylesConfig } from 'react-select'

type Option = { value: string; label: string }

interface OptionType {
  value: string;
  label: string;
  color?: string;
}


const customStyles: StylesConfig<OptionType, false> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "transparent",
    color: "#000000",
    fontSize: "14px",
    padding: "2px",
    cursor: "pointer",
    borderRadius: "4px",
    boxShadow: "none", // remove default blue focus ring
    outline: "none",
    "&:hover": {
    },
  }),
  input: (provided) => ({
    ...provided,
    color: "#000000",
    fontSize: "14px",
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: "14px",
    color: "#000000",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "#000000",
    fontSize: "14px",
    cursor: "pointer",
    "&:hover": {
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "14px",
    color: "#000000",
  }),
  multiValue: (base, { data }) => ({
    ...base,
    color: "#000000",
    borderRadius: "5px",
    padding: "3px 6px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#000000",
    fontWeight: "500",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#000000",
    cursor: "pointer",
    ":hover": {
      color: "#000000",
    },
  }),
};


export default function ReactSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
}: {
  options: Option[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const selected = options.find(o => o.value === value) || null
  return (
    <Select
      className={className}
      options={options}
      components={{ IndicatorSeparator: () => null }}
      value={selected}
      onChange={(opt: SingleValue<Option>) => onChange(opt?.value || '')}
      placeholder={placeholder || 'Select'}
      isSearchable
      styles={customStyles}
    />
  )
}
