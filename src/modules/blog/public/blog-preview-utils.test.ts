import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { blogPreviewArticles } from "./blog-preview-fixtures";
import { BlogView } from "./blog-view";
import {
  createBlogPreviewHref,
  loadBlogPreviewRouteData,
  parseBlogPreviewParams,
} from "./blog-preview-utils";

describe("final blog fixtures and route state", () => {
  it("keeps one deterministic fixture set for the final blog routes", () => {
    expect(blogPreviewArticles).toHaveLength(3);
    expect(
      loadBlogPreviewRouteData({
        view: "listing",
        scenario: "populated",
        category: "all",
      }).articles.map((article) => article.slug),
    ).toEqual(blogPreviewArticles.map((article) => article.slug));
  });

  it("filters the final listing by category without changing fixtures", () => {
    const result = loadBlogPreviewRouteData({
      view: "listing",
      scenario: "populated",
      category: "technical",
    });

    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]?.category).toBe("technical");
    expect(blogPreviewArticles).toHaveLength(3);
  });

  it("represents loading, error, empty, and missing article states", () => {
    expect(
      loadBlogPreviewRouteData({
        view: "listing",
        scenario: "loading",
        category: "all",
      }),
    ).toMatchObject({ scenario: "loading", articles: blogPreviewArticles });
    expect(
      loadBlogPreviewRouteData({
        view: "listing",
        scenario: "empty",
        category: "all",
      }),
    ).toMatchObject({ scenario: "empty", articles: [] });
    expect(
      loadBlogPreviewRouteData({
        view: "listing",
        scenario: "error",
        category: "all",
      }).scenario,
    ).toBe("error");
    expect(
      loadBlogPreviewRouteData({
        view: "article",
        scenario: "populated",
        category: "all",
        slug: "missing-article",
      }).article,
    ).toBeNull();
  });

  it("normalizes malformed route state to safe defaults", () => {
    expect(
      parseBlogPreviewParams({
        view: "unknown",
        scenario: "unknown",
        category: "unknown",
      }),
    ).toEqual({
      view: "listing",
      scenario: "populated",
      category: "all",
      slug: undefined,
    });
  });

  it("builds only internal final blog URLs", () => {
    expect(
      createBlogPreviewHref({
        view: "listing",
        scenario: "populated",
        category: "technical",
      }),
    ).toBe("/blog?scenario=populated&category=technical");
    expect(
      createBlogPreviewHref({
        view: "article",
        scenario: "populated",
        slug: blogPreviewArticles[1]?.slug,
      }),
    ).toContain("/blog/");
    expect(
      createBlogPreviewHref({
        view: "article",
        scenario: "populated",
        slug: blogPreviewArticles[1]?.slug,
      }),
    ).not.toContain("http");
  });

  it("renders the final listing and article with RTL-safe semantic structure", () => {
    const listingHtml = renderToStaticMarkup(
      createElement(BlogView, {
        data: loadBlogPreviewRouteData({
          view: "listing",
          scenario: "populated",
          category: "all",
        }),
      }),
    );
    const articleHtml = renderToStaticMarkup(
      createElement(BlogView, {
        data: loadBlogPreviewRouteData({
          view: "article",
          scenario: "populated",
          category: "all",
          slug: blogPreviewArticles[0]?.slug,
        }),
      }),
    );

    expect(listingHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(listingHtml).toContain('href="/blog/');
    expect(listingHtml).toContain("محتوای منتشرشده واقعی نیستند");
    expect(articleHtml.match(/<article\b/g)).toHaveLength(1);
    expect(articleHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(articleHtml).toContain("محتوای نمونه");
    expect(articleHtml).toContain('alt="جاده‌ای در میان جنگل مه‌آلود');
  });
});
