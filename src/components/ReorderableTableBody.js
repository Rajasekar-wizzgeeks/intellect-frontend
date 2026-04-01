import React from "react";
import { Reorder, useDragControls } from "framer-motion";

export const ReorderHandle = ({ className = "", style, onPointerDown }) => {
  return (
    <button
      type="button"
      aria-label="Reorder"
      className={className}
      style={style}
      onPointerDown={onPointerDown}
    />
  );
};

export const ReorderableTr = ({
  as = "tr",
  value,
  controls,
  children,
  className,
  style,
  ...rest
}) => {
  const internalControls = useDragControls();
  const dragControls = controls ?? internalControls;

  return (
    <Reorder.Item
      as={as}
      value={value}
      dragListener={false}
      dragControls={dragControls}
      className={className}
      style={style}
      {...rest}
    >
      {typeof children === "function" ? children(dragControls) : children}
    </Reorder.Item>
  );
};

const ReorderableTableBody = ({
  as = "tbody",
  items,
  onReorder,
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <Reorder.Group
      as={as}
      axis="y"
      values={items}
      onReorder={onReorder}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Reorder.Group>
  );
};

export default ReorderableTableBody;
