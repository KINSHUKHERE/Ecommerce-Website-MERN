import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// Helper to split styling between wrapper and inner input
const splitClasses = (className = "") => {
  if (!className) return { wrapper: "", input: "" };
  const classes = className.split(/\s+/);
  const wrapperClasses = [];
  const inputClasses = [];

  classes.forEach(c => {
    if (!c) return;
    // Check if the class is wrapper-like (e.g. border, bg, rounded, rings, etc.)
    if (
      c.startsWith("border") ||
      c.startsWith("bg-") ||
      c.startsWith("rounded") ||
      c.includes("ring") ||
      c.startsWith("w-") ||
      c.startsWith("h-") ||
      c.startsWith("shadow") ||
      c.startsWith("max-w-") ||
      c.startsWith("transition") ||
      c.startsWith("duration-") ||
      c.startsWith("focus-within:") ||
      c.startsWith("hover:") ||
      c.startsWith("flex") ||
      c.startsWith("grid") ||
      c.startsWith("hidden") ||
      c.startsWith("col-") ||
      c.startsWith("row-") ||
      c.startsWith("items-") ||
      c.startsWith("justify-") ||
      c.startsWith("relative") ||
      c.startsWith("absolute") ||
      c.startsWith("top-") ||
      c.startsWith("bottom-") ||
      c.startsWith("left-") ||
      c.startsWith("right-") ||
      c.startsWith("z-") ||
      c.startsWith("overflow-") ||
      c.startsWith("select-") ||
      c.startsWith("opacity-")
    ) {
      if (c.startsWith("focus:")) {
        // Translate input focus states to wrapper focus-within states
        wrapperClasses.push(c.replace("focus:", "focus-within:"));
      } else {
        wrapperClasses.push(c);
      }
    } else if (c.startsWith("focus:")) {
      // standard focus classes that might not be borders/rings can be skipped or passed
      if (c.includes("border") || c.includes("ring")) {
        wrapperClasses.push(c.replace("focus:", "focus-within:"));
      } else {
        inputClasses.push(c);
      }
    } else {
      inputClasses.push(c);
    }
  });

  // Ensure inner input has bg-transparent, outline-none and width full
  return {
    wrapper: wrapperClasses.join(" "),
    input: [
      "bg-transparent",
      "outline-none",
      "w-full",
      ...inputClasses.filter(c => c !== "w-full" && c !== "focus:outline-none")
    ].join(" ")
  };
};

const PASSWORD_CHAR = typeof window !== "undefined" && navigator.userAgent.match(/firefox|fxios/i)
  ? "\u25CF"
  : "\u2022";

export const SmoothInput = forwardRef(({
  className = "",
  wrapperClassName = "",
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  type = "text",
  placeholder = "",
  style = {},
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const isControlled = value !== undefined;
  const inputValue = isControlled ? String(value) : internalValue;

  // Spring configuration for the smooth caret
  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : { stiffness: 500, damping: 30, mass: 0.5 }
  );

  // Expose the input element to parent components
  useImperativeHandle(ref, () => inputRef.current);

  const syncMeasureSpan = () => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return;

    const styles = window.getComputedStyle(input);
    const isPassword = type === "password";

    let fontSize = styles.fontSize;
    if (
      PASSWORD_CHAR === "\u2022" &&
      isPassword &&
      !navigator.userAgent.match(/chrome|chromium|crios/i)
    ) {
      fontSize = `${parseFloat(fontSize) + 6.25}px`;
    }

    // Set styling individual properties directly for maximum reliability across browsers
    measureSpan.style.fontSize = fontSize;
    measureSpan.style.fontFamily = styles.fontFamily;
    measureSpan.style.fontWeight = styles.fontWeight;
    measureSpan.style.fontStyle = styles.fontStyle;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
    measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
    measureSpan.style.textTransform = styles.textTransform;
  };

  const measurePrefixWidth = (text) => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return null;

    syncMeasureSpan();
    measureSpan.textContent = text;

    const paddingLeft = parseFloat(window.getComputedStyle(input).paddingLeft) || 0;

    return text.length > 0
      ? measureSpan.offsetWidth + paddingLeft
      : paddingLeft - 1;
  };

  const scrollCaretIntoView = (target, absoluteWidth) => {
    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
    const visibleLeft = target.scrollLeft + paddingLeft;

    if (absoluteWidth > visibleRight) {
      target.scrollLeft = Math.min(
        absoluteWidth - target.clientWidth + paddingRight,
        maxScroll
      );
      return;
    }

    if (absoluteWidth < visibleLeft) {
      target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
    }
  };

  const getCaretIndex = (target) => {
    try {
      const selectionStart = target.selectionStart;
      if (selectionStart === null || selectionStart === undefined) {
        return target.value.length;
      }
      const selectionEnd = target.selectionEnd ?? 0;

      if (selectionStart === selectionEnd) {
        return selectionStart;
      }

      return target.selectionDirection === "backward"
        ? selectionStart
        : selectionEnd;
    } catch (e) {
      // Fallback for inputs that do not support selectionStart (e.g., email, number)
      return target.value.length;
    }
  };

  const updateCaretFromInput = (target) => {
    if (!target) return;

    let selectionStart = 0;
    let selectionEnd = 0;
    let hasSelection = false;
    let caretIndex = target.value.length;

    try {
      selectionStart = target.selectionStart ?? 0;
      selectionEnd = target.selectionEnd ?? 0;
      hasSelection = selectionStart !== selectionEnd;
      caretIndex = getCaretIndex(target);
    } catch (e) {
      caretIndex = target.value.length;
    }

    const isPassword = type === "password";
    const textBeforeCaret = isPassword
      ? PASSWORD_CHAR.repeat(caretIndex)
      : target.value.slice(0, caretIndex);

    const absoluteWidth = measurePrefixWidth(textBeforeCaret);
    if (absoluteWidth === null) return;

    scrollCaretIntoView(target, absoluteWidth);

    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const caretPosition = absoluteWidth - target.scrollLeft;
    const minX = paddingLeft - 1;
    const maxX = target.clientWidth - paddingRight;
    const isCaretVisible = caretPosition >= minX && caretPosition <= maxX + 1;

    caretX.set(Math.min(caretPosition, maxX));

    if (!isCaretVisible || hasSelection) {
      caretOpacity.set(0);
      return;
    }

    caretOpacity.set(1);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      updateCaretFromInput(input);
    }
  }, [inputValue, type]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;

    const updateCaretIfFocused = () => {
      if (document.activeElement === input) {
        updateCaretFromInput(input);
      }
    };

    const handleSelectionChange = () => {
      if (document.activeElement !== input) return;
      requestAnimationFrame(() => {
        if (document.activeElement === input) {
          updateCaretFromInput(input);
        }
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.fonts.addEventListener("loadingdone", updateCaretIfFocused);
    void document.fonts.ready.then(updateCaretIfFocused);
    input.addEventListener("scroll", updateCaretIfFocused);

    const resizeObserver = new ResizeObserver(updateCaretIfFocused);
    resizeObserver.observe(container);

    updateCaretIfFocused();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.fonts.removeEventListener("loadingdone", updateCaretIfFocused);
      input.removeEventListener("scroll", updateCaretIfFocused);
      resizeObserver.disconnect();
    };
  }, []);

  // Split classNames
  const { wrapper: splitWrapperClass, input: splitInputClass } = splitClasses(className);

  const finalWrapperClass = [
    "relative w-full overflow-hidden transition-all duration-200",
    splitWrapperClass,
    wrapperClassName
  ].filter(Boolean).join(" ");

  return (
    <div className={finalWrapperClass}>
      <div
        ref={containerRef}
        className="relative grid grid-cols-1 p-0 w-full"
        style={{ caretColor: "transparent" }}
      >
        <input
          {...props}
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          className={`${splitInputClass} col-start-1 col-end-2 row-start-1 row-end-2 text-inherit`}
          style={style}
          value={inputValue}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
            requestAnimationFrame(() => {
              updateCaretFromInput(e.target);
            });
          }}
          onFocus={(e) => {
            caretOpacity.set(1);
            onFocus?.(e);
            requestAnimationFrame(() => {
              updateCaretFromInput(e.target);
            });
          }}
          onBlur={(e) => {
            caretOpacity.set(0);
            onBlur?.(e);
          }}
        />
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
        />
        <motion.div
          className="bg-primary pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[1.2em] w-0.5 self-center"
          style={{ x: springCaretX, opacity: caretOpacity }}
        />
      </div>
    </div>
  );
});

SmoothInput.displayName = "SmoothInput";
