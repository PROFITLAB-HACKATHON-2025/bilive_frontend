import styled from "styled-components";

export const Card = styled.button`
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  width: 100%;
`;

export const CardTitle = styled.div`
  font-weight: 800;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text};
`;

export const CardMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subText};
`;