import React, {useState} from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import { useVerification } from './verification-context';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from '@iconify/react';

const LocationSearchInput = () => {
    const verification = useVerification();
    const [address, setAddress] = useState("");

    const handleChange = address => {
        setAddress(address);
        verification.setAddress(address);
    }

    const handleSelect = address => {
        setAddress(address);
        verification.setAddress(address);
    }

    return (
        <PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <GooglePlacesDiv>
            <div id='search_div' className='d-flex align-items-center'>
              <p className='ps-2'>
                <Icon icon='akar-icons:search' />
              </p>
              <input
                  {...getInputProps({
                      placeholder: 'Search your address',
                      className: 'location-search-input form-control border-0',
                  })}
              />
            </div>
            <div className="autocomplete-dropdown-container" style={{paddingBottom: _.isEmpty(suggestions)? 0: 4}}>
              {loading && <div className='text-center'>Loading...</div>}
              {suggestions.map((suggestion, index) => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
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
}

export default LocationSearchInput;

const GooglePlacesDiv = styled.div`
  position: relative;
  p {
    color: black;
  }
  div#search_div {
    background-color: white;
    input {
      font-size: 13px;
    }
  }
  div.autocomplete-dropdown-container {
    background-color: white;
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