import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from '@iconify/react';

const LocationSearchInput = ({ address, setAddress, className }) => {
    const handleChange = address => {
        setAddress(address);
    }

    const handleSelect = address => {
        setAddress(address);
    }

    return (
        <PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <GooglePlacesDiv className={className}>
            <div id='search_div' className='d-flex align-items-center'>
              <p className='ps-2'>
                <Icon icon='akar-icons:search' />
              </p>
              <input
                  {...getInputProps({
                      placeholder: 'Search address',
                      className: 'location-search-input form-control border-0',
                  })}
              />
            </div>
            <div className="autocomplete-dropdown-container" style={{paddingBottom: _.isEmpty(suggestions)? 0: 4, border: _.isEmpty(suggestions)? 'none': '1px solid white'}}>
              {loading && <div className='text-center'>Loading...</div>}
              {suggestions.map((suggestion, index) => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#292626', cursor: 'pointer' }
                  : { backgroundColor: '#1e1e1e', cursor: 'pointer' };
                return (
                  <div key={index}
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <div className='dropdown_item d-flex align-items-center'>
                      <p className='ps-2'>
                        <Icon icon='fa6-solid:location-dot' />
                      </p>
                      <p className='ps-3 desc'>{suggestion.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GooglePlacesDiv>
        )}
      </PlacesAutocomplete>
    )
};

export default LocationSearchInput;

const GooglePlacesDiv = styled.div`
  position: relative;
  div#search_div {
    background-color: inherit;
    height: 47px;
    input {
      font-size: 13px;
      background-color: inherit;
      color: white;
    }
  }
  div.autocomplete-dropdown-container {
    position: absolute;
    width: 100%;
    .dropdown_item {
      min-height: 30px;
      p.desc {
        font-size: 12px;
      }
    }
  }
`;