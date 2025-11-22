<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet 
  version="1.0" 
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
>

<xsl:template match="/">
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <style>
        @import "/style.css";
        section {
          background-color: lightblue;
          margin: 2ch 0;
          padding: 2ch;
        }
        section div {
          max-width: 100%;
          background-color: orange !important;
        }
      </style>
    </head>
    <body>
      <h1>RSS: <xsl:value-of select="atom:feed/atom:title"/></h1>
      <p><strong>This is a web feed,</strong> also known as an RSS feed. It contains a list of updates on this site.</p>
      <p>You can subscribe with any RSS reader such as <a href="https://feedly.com/">Feedly</a> or <a href="https://www.freshrss.org/">FreshRSS</a>.</p>
      <p>You can even get notifications on Discord when this feed updates, using <a href="https://monitorss.xyz/">MonitoRSS</a>.</p>
      <xsl:apply-templates select="atom:feed/atom:entry"/>
    </body>
  </html>
</xsl:template>

<xsl:template match="atom:entry">
  <section>
    <h3>
      <a target="_blank">
        <xsl:attribute name="href"><xsl:value-of select="atom:link[@rel='alternate']/@href"/></xsl:attribute>
        <xsl:value-of select="atom:title"/>
      </a>
    </h3>
    <xsl:apply-templates select="atom:content/*"/>
  </section>
</xsl:template>

<!-- 
<xsl:template match="*[local-name()='img'][1]">
  this selects only the first image in the content. might be useful.
</xsl:template> 
-->

<!-- transform all remaining tags as themselves -->
<xsl:template match="*"> 
  <xsl:element name="{local-name()}">
    <xsl:apply-templates select="@*|node()"/>
  </xsl:element>
</xsl:template>

<xsl:template match="@*">
  <xsl:copy />
</xsl:template>

</xsl:stylesheet>