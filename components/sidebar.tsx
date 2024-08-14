import React from "react";
import { Box, List, ListItem, ListItemText, Link } from "@mui/material";

type Location = {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
};

type SidebarProps = {
  locations: Location[];
  onTabHover: (index: number | null) => void;
  onTabClick: (index: number) => void;
};

const Sidebar = ({ locations, onTabHover, onTabClick }: SidebarProps) => {
  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflowY: 'scroll' }}>
      <List>
        {locations.map((location, index) => (
          <ListItem
            button
            key={index}
            onMouseEnter={() => onTabHover(index)}
            onMouseLeave={() => onTabHover(null)}
            onClick={() => onTabClick(index)}
            sx={{
              padding: '16px',
              margin: '8px 0',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <ListItemText
              primary={location.name}
              secondary={location.description}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 'bold',
                },
                '& .MuiListItemText-secondary': {
                  color: '#757575',
                },
              }}
            />
            <Link
              href={`https://www.google.com/maps/@${location.latitude},${location.longitude},3a,75y,90t/data=!3m6!1e1!3m4!1s${location.id}!2e0!7i16384!8i8192`}
              target="_blank"
              rel="noopener"
              sx={{
                marginLeft: '16px',
                textDecoration: 'none',
                color: 'blue',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Street View
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
