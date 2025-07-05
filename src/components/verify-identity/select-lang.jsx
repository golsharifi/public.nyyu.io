import React from "react"
import Select from "react-select"

export default function SelectLang({ languages, langKey, onLangChange, ...rest }) {
    const langs = Object.keys(languages).map((key) => {
        return { label: languages[key].name, value: key }
    })

    return (
        <Select
            {...rest}
            options={langs}
            value={{ label: languages[langKey]?.name, value: langKey }}
            onChange={(res) => onLangChange(res)}
            styles={customSelectStyles}
        />
    )
};

const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      color: 'white',
      backgroundColor: state.isSelected ? '#23c865' : '#1e1e1e',
      fontSize: 14
    }),
    control: provided => ({
      ...provided,
      backgroundColor: '#1e1e1e',
      width: 150,
      borderRadius: 0
    }),
    menu: provided => ({
        ...provided,
        backgroundColor: '#1e1e1e',
        border: '1px solid white',
        borderRadius: 0
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),
    singleValue: provided => ({
        ...provided,
        color: 'white',
    }),
    input: provided => ({
        ...provided,
        color: 'white'
    })
};
