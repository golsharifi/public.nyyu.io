import React, { useEffect, useState, useMemo } from 'react';
import Pagination from '@mui/material/Pagination';
// import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import Select from 'react-select';

const limitOptions = [
  {label: 'Five', value: 5},
  {label: 'Ten', value: 10},
  {label: 'Twenty', value: 20},
];

export default function PaginationBar({ setPage, page, limit = 5, total }) {
  const [option, setOption] = useState(limitOptions[0]);
  const [navPage, setNavPage] = useState('');

  const count = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  useEffect(() => {
    if(!total) return;
    if(page > count) setPage({ page: count, limit });
  }, [setPage, page, limit, total, count]);

  const handleSetPage = (event, value) => {
    event.preventDefault();
    setPage({page: Number(value), limit});
    setNavPage(value);
  };

  const handleNavPage = () => {
    if(Number(navPage) > count) {
      setPage({ page: count, limit });
      setNavPage(count);
    } else if(Number(navPage) <= 0) {
      setPage({ page: 1, limit });
      setNavPage(1);
    } else {
      setPage({ page: Number(navPage), limit });
    }
  };

  const handleKeyDown = e => {
    if(e.key === '.') {
      e.preventDefault();
    }
    if(e.key === 'Enter') {
      handleNavPage();
    }
  };

  return (
    <div className="row mt-2 mb-4">
      <div className="col-md-6">
        <Stack spacing={2} m={1}>
          <Pagination count={Math.ceil(total / limit)} page={Number(page)} onChange={handleSetPage} siblingCount={1} boundaryCount={1} showFirstButton showLastButton />
        </Stack>
      </div>
      <div className="col-md-6 d-flex">
        <div className="w-50 pe-2 d-flex ">
          <input className="black_input me-1" type='number' style={{height: 40}}
            min={1} step={1} max={count}
            value={navPage}
            onChange={e => setNavPage(e.target.value)}
            onKeyPress={handleKeyDown}
            placeholder='Go to page'
          />
          <button className='btn btn-outline-light' style={{height: 40}} onClick={handleNavPage}>
            Go
          </button>
        </div>
        <div className="w-50 ps-2">
          <Select
            isSearchable={false}
            options={limitOptions}
            value={option}
            onChange={selected => { setOption(selected); setPage({page, limit: selected.value}); }}
            className="black_input"
            styles={customSelectStyles}
          />
        </div>
      </div>
    </div>
  );
}

const customSelectStyles = {
  option: (provided, state) => ({
      ...provided,
      color: "white",
      backgroundColor: state.isSelected ? "#23c865" : undefined,
      fontSize: 14,
      borderBottom: "1px solid dimgrey",
      cursor: "pointer",
      ":hover": {
          backgroundColor: "inherit",
      },
  }),
  control: (provided) => ({
      ...provided,
      backgroundColor: "#1e1e1e",
      border: "none",
      borderRadius: 0,
      height: 35,
      cursor: "pointer",
  }),
  menu: (provided) => ({
      ...provided,
      borderRadius: 0,
      backgroundColor: "#1e1e1e",
      border: "1px solid white",
  }),
  menuList: (provided) => ({
      ...provided,
      borderRadius: 0,
      margin: 0,
      padding: 0,
  }),
  valueContainer: (provided) => ({
      ...provided,
      padding: 0,
  }),
  singleValue: (provided) => ({
      ...provided,
      color: "white",
      marginLeft: 10,
  }),
  placeholder: (provided) => ({
      ...provided,
      color: "dimgrey",
  }),
};