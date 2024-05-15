import styled from "@emotion/styled";

export const Button = styled.button`
border-radius: 3px;
padding: 0px 8px;
border: 1px solid ${p => p.active ? 'black' : 'black'};
text-decoration: none;
font-size: 0.9em;
cursor: ${p => p.active ? 'default' : 'pointer'};

background: ${p => p.active ? '#ffffff' : 'black'};
color: ${p => p.active ? '#000000' : '#ffffff'};
font-weight: ${p => p.active ? '600' : '400'};

&:hover {
  background: white;
  border-color: ${p => p.active ? 'black' : '#000000'};
  color: black;
}
`