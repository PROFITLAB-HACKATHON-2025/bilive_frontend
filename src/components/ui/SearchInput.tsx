import styled from "styled-components";

export const SearchBox = styled.div`
  margin-top: 14px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const SearchField = styled.input`
  border: 0;
  outline: none;
  width: 100%;
  background: transparent;
  font-size: 14px;
`;