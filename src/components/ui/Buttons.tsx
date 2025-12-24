import styled from "styled-components";

export const Chip = styled.button`
  border: 0;
  padding: 8px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.chip};
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
`;

export const CircleBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;