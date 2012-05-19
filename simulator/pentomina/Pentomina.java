import java.applet.*;
import java.awt.*;
import java.awt.event.*;
import java.util.LinkedList;
import java.net.*;
import java.io.*;
import java.net.HttpURLConnection;

import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.stream.StreamResult;
import net.sf.saxon.Configuration;
import net.sf.saxon.query.DynamicQueryContext;
import net.sf.saxon.query.StaticQueryContext;
import net.sf.saxon.query.XQueryExpression;
import net.sf.saxon.trans.XPathException;

public class Task4 {

    public static void main(String[] args) throws XPathException, IOException {

        Configuration config = new Configuration();

        StaticQueryContext staticContext = config.newStaticQueryContext();

        XQueryExpression exp = staticContext.compileQuery(new FileReader("sales.xq"));
        
        DynamicQueryContext dynamicContext =
                new DynamicQueryContext(config);

        Properties props = new Properties();
        props.setProperty(OutputKeys.METHOD, "xml");
        props.setProperty(OutputKeys.INDENT, "yes");

        exp.run(dynamicContext, new StreamResult(System.out), props);
    }
}


/*********************************************
     trida Dilek pro praci s hracimi kameny
*********************************************/

class Dilek{
   private char [][] matice;
   private int m,n;
   private Color color;
   private int x,y;
   private int ID;

   Dilek(int x, int y, Color color, char [][] p, int id){
      this.x = x;
      this.y = y;
      this.color = color;
      this.m = p.length;           // m,n - rozmery matice dilku 
      this.n = p[0].length;
      this.ID = id;
      matice=new char [m][n];
      for ( int i=0; i<m; i++ ) {
         for (int j=0; j<n; j++ ) {
            this.matice[i][j]=p[i][j];
         }
      }
   }

   int getX() {
      return x;
   }
   int getY() {
      return y;
   }          
   int getID() {
      return ID;
   }                             
   void setX(int x) {
      this.x=x;
   }
   void setY(int y) {
      this.y=y;
   }
   int getM() {
      return m;
   }
   int getN() {
      return n;
   }
   Color getColor() {
      return color;
   }

   char [][] getMat() {
      return matice;
   }

   void rotaceDoleva() {
      char [][] pomocna=new char [n][m];         // pomocna matice pro orotovany dilek
      for ( int i=0; i<m; i++ ) {
         for (int j=0; j<n; j++ ) {
            pomocna[j][m-i-1] = this.matice[i][j];
         }
      }
      this.matice = new char [n][m];
      this.m = pomocna.length;
      this.n = pomocna[0].length;
      this.matice = pomocna;    
   }

   void rotaceDoprava() {
      char [][] pomocna=new char [n][m];
      for ( int i=0; i<m; i++ ) {
         for (int j=0; j<n; j++ ) {
            pomocna[n-j-1][i] = this.matice[i][j];
         }
      }
      this.matice = new char [n][m];
      this.m = pomocna.length;
      this.n = pomocna[0].length;
      this.matice = pomocna;    
   }

   void zrcadleni() {
      for ( int i=0; i<m/2; i++ ) {
         for (int j=0; j<n; j++ ) {
            char pom = this.matice[m-i-1][j];
            this.matice[m-i-1][j] = this.matice[i][j];
            this.matice[i][j] = pom;
         }
      }
   }
}


/*********************************************
     hlavni trida apletu Pentomina
*********************************************/

public class Pentomina extends Applet
   implements MouseListener,MouseMotionListener,ActionListener,KeyListener,FocusListener {

   private int width, height;
   private int mx, my;                      // souradnice aktualni pozice mysi
   private Image img_dilekstin, img_dilek, img_deskaokraj, img_deska;      // obrazky
   private int velikostX,velikostY;        // velikost hraci desky
   private int ROZMER = 40;                // rozmer jednoho ctverecku,ze kterych se sklada hraci dilky
   private Image backbuffer;               // slouzi k rychlejsimu vykresleni obrazku, ulozeni obrazku dopozadi
   private Graphics backg;                 // instance backbufferu
   private Dilek aktualni;
   private LinkedList<Dilek> hraciSada;    // lin.seznam vsech vsech hracich dilku
   private boolean drag = false;           // k rozpoznani, zda muzeme s dilkem tahnout, tj. bylo na nej kliknuto pred tazenim
   private boolean slozeno = true;
   private int pocatekX;                   // pocatecni souradnice hraci plochy
   private int pocatekY;
   private String str="";                  // pomocny string k vypisovani
   private int uchyceni = 20;              // k uchycovani dilku do hraci plochy
   private static char PRAZDNE='.';        // pro budouci nastaveni, co bude v databazi oznaceni prazdneho pole
   private static char PLNE='x'; 
   private char [][] deska;                // hraci deska
   private int pocitadlo_pohybu = 1;
   private String pomLog = "";
   private Button doprava,doleva,zrcadleni;  // tlacitka

   public void init() {
      width = getSize().width;
      height = getSize().height;
   
      hraciSada = new LinkedList<Dilek>();
 
      
      pocitadlo_pohybu = 1;
      pomLog = "";
     
      // v tomto miste se bude zpracovavat nacteni z databaze
      // zatim testovaci data
                  
                    
      
    /*  char [][] pomDeska = {{'.','x','x','x','x'},{'x','x','x','x','x'},{'x','x','.','.','.'},{'x','x','.','.','.'},{'.','x','x','x','x'},{'.','x','x','x','.'}};
      char [][] m1 = {{'.','x','x'},{'x','x','.'}};        
      char [][] m2 = {{'x'}};
      char [][] m3 = {{'x','x'},{'x','.'}};
      char [][] m4 = {{'x','.'},{'x','.'}};
      char [][] m5 = {{'x','x'},{'.','x'},{'.','x'},{'.','x'}};
      char [][] m6 = {{'x','x','x'},{'x','x','.'}};    */     
      
      // konec nacitani z databaze
      

  /*    hraciSada.add( new Dilek(50,70,Color.white,m1,1) );                 // pridani dilku do hraci sady
      hraciSada.add( new Dilek(200,40,Color.orange,m2,2) );
      hraciSada.add( new Dilek(400,130,Color.yellow,m3,3) );
      hraciSada.add( new Dilek(20,200,Color.green,m4,4) );                 // pridani dilku do hraci sady
      hraciSada.add( new Dilek(30,360,Color.cyan,m5,5) );
      hraciSada.add( new Dilek(400,330,Color.red,m6,6) ); */
      

      // nacteni pouzitych obrazku
      img_dilekstin = getImage(getDocumentBase(), "stin.png");
      img_dilek = getImage(getDocumentBase(), "plasticky.png");
      img_deska = getImage(getDocumentBase(), "deska.png");
      backbuffer = createImage( width, height );
      backg = backbuffer.getGraphics();
      repaint();
      
      
           
      str = getParameter("instance_plan");
      char hra[] = str.toCharArray();
      str="";
      
      int rozmerX=0,rozmerY=0,pozX=0,pozY=0;
      int rgb[]= {0,0,0};
      char [][] matice = {{'x'}};    // naplneni kvuli kompilaci, chtelo to inicializaci
      int i = 0;
      char znak='n';
      int pom = -1;
      boolean poprve = true;
      while (i < hra.length) {
        
        pom = pom+1;
        znak = hra[i];
        rozmerX = 0; rozmerY=0;  pozX=0;  pozY=0;  rgb[0] = 0; rgb[1] = 0; rgb[2] = 0;
        while (znak != ',') {
          rozmerX = 10*rozmerX+znak-(int)'0';
          i = i+1;
          znak = hra[i];
        }
        i = i+1;
        znak = hra[i];
        while (znak != ',') {
          rozmerY = 10*rozmerY+znak-(int)'0';
          i = i+1;
          znak = hra[i];
        }
        i = i+1;
        znak = hra[i];
        
        
        if (!poprve) {
          for (int j=0; j<3; j++) {
            while (znak != ',') {
              rgb[j] = 10*rgb[j]+znak-(int)'0';
              i = i+1;
              znak = hra[i];
            }
            i = i+1;
            znak = hra[i];
          }
          while (znak != ',') {
            pozX = 10*pozX+znak-(int)'0';
            i = i+1;
            znak = hra[i];
          }
          i = i+1;
          znak = hra[i];
          while (znak != ',') {
            pozY = 10*pozY+znak-(int)'0';
            i = i+1;
            znak = hra[i];
          }
          i = i+1;
          znak = hra[i];
        }
        
        
        if (poprve) {
          deska = new char [rozmerX][rozmerY];
        }
        matice = new char [rozmerX][rozmerY];
        for (int k=0; k<rozmerX; k++) {
          for (int l=0; l<rozmerY; l++) {
            if (poprve) {
              deska[k][l] = hra[i];
            } else {
              matice[k][l] = hra[i];
            }
            i = i+1;
          }
        }   
        if (!poprve) {
          hraciSada.add( new Dilek(pozX,pozY, new Color(rgb[0],rgb[1],rgb[2]) ,matice,pom) );                 
        }                
        poprve = false;     
      }                     
      
   //   deska = pomDeska;
      velikostX = deska.length;
      velikostY = deska[0].length;
      pocatekX = width/2 - (velikostX*ROZMER)/2;
      pocatekY = height/2 - (velikostY*ROZMER)/2;   
      

      addKeyListener( this );
      addMouseListener( this );
      addMouseMotionListener( this );
      addFocusListener(this);

      vytvoreniTlacitek();        
      
   }
   
   void vytvoreniTlacitek() { 
     setLayout(new FlowLayout()); 
     
     doprava = new Button("Doprava (R)");
     add(doprava);
     doprava.addActionListener(this); 

     doleva = new Button("Doleva (L)");
     add(doleva);
     doleva.addActionListener(this); 

     zrcadleni = new Button("Zrcadlit (O)");
     add(zrcadleni);
     zrcadleni.addActionListener(this); 
    
   }    
   
   public void actionPerformed( ActionEvent e ) {            // odchytava tlacitka
     if (e.getActionCommand() == "Doprava (R)") {
       rotaceDoprava();
     } else if (e.getActionCommand() == "Doleva (L)") {
       rotaceDoleva();
     } else if (e.getActionCommand() == "Zrcadlit (O)" ) {
       zrcadleni();
     } 
     requestFocus();  
   }   
   
   public void focusGained(FocusEvent evt) {  }
   public void focusLost(FocusEvent evt) {   }     
   
   
   public void keyPressed( KeyEvent e ) {      // metoda ke zjisteni stisku klavesy
     int c = e.getKeyCode();
      switch(c) {
         case 76: rotaceDoleva();              // l
                  break;
         case 82: rotaceDoprava();            // r
                  break;
         case 79: zrcadleni();                 // o
                  break;
      }
      repaint();   
      e.consume();  
   }
   
   public void keyReleased( KeyEvent e ) { }
  
   public void keyTyped( KeyEvent e ) {  }

   public void mouseEntered( MouseEvent e ) { }
   public void mouseExited( MouseEvent e ) { }
   public void mouseMoved( MouseEvent e ) { }


   public void mouseClicked( MouseEvent e ) { 
   /*  if (e.getClickCount()==2) {      // dvojklik stejnym tlacitkem
       if (e.getButton()==1) {
         rotaceDoprava();
         zrcadleni();
       } else if (e.getButton()==3) {
         rotaceDoleva();
         zrcadleni();
       }   
     } else */if (e.getClickCount()==1) {       // jeden klik
       if (e.getButton()==1) {         // leve tlacitko
         rotaceDoleva();
       } else if (e.getButton()==3) {      // prave tlacitko
         rotaceDoprava(); 
       }
     } 
     e.consume();
   }
	

   public void mousePressed( MouseEvent e ) {     // zjisteni, kam na plose bylo kliknuto
      requestFocus();
      
      mx = e.getX();
      my = e.getY();

      char [][] matice;
      int pozX, pozY, m, n;
      boolean nalezeno = false;
      for (Dilek d : hraciSada) { 
         matice = d.getMat();
         pozX = d.getX();
         pozY = d.getY();
         m = d.getM();
         n = d.getN();
         for ( int i=0; i<m; i++ ) {
            for ( int j=0; j<n; j++ ) {
               if ( matice[i][j] != PRAZDNE ) {    
                  // zjistine, zda bylo kliknuto na dilek 
                  if ( pozX+i*ROZMER < mx && mx < pozX+(i+1)*ROZMER && pozY+j*ROZMER < my && pozY+(j+1)*ROZMER > my ) {
                     aktualni = d;
                     nalezeno = true;
                  }
               }
            }
         }
      }
      if (nalezeno) {
         hraciSada.remove(aktualni);
         hraciSada.addLast(aktualni);    // premisteni aktualniho dilku na vrchol zasobniku
         drag = true;
         aktualni.setX(aktualni.getX()-2);    // zvyrazneni, ze bylo kliknuto na dilek - posune se
         aktualni.setY(aktualni.getY()-3); 
      }
      repaint();
      e.consume();
   }


   public void mouseReleased( MouseEvent e ) {  // bylo pusteno tlacitko mysi
      str = "";
      int pozX = aktualni.getX();    // zjisteni souradnic aktualniho dilku
      int pozY = aktualni.getY();
      // zda souradnice aktualniho dilku jsou v blizkosti hraci plochy
      if ( pozX >= pocatekX-uchyceni && pozX < pocatekX+velikostX*ROZMER-uchyceni && pozY > pocatekY-uchyceni && pozY < pocatekY+velikostY*ROZMER-uchyceni ) {
         int posunx = (pozX - pocatekX) % ROZMER;    //  vzdalenost od nejblizsiho pruseciku na hraci plose
         int posuny = (pozY - pocatekY) % ROZMER;
         // zjisteni, zda budeme prichytavat kosticku k pruseciku ci ji zanechame na miste
         if ( ( posunx < uchyceni || posunx > ROZMER-uchyceni ) && ( posuny < uchyceni || posuny > ROZMER-uchyceni ) ) {
            if (posunx > ROZMER - uchyceni)
               posunx = posunx - ROZMER;
            if (posuny > ROZMER - uchyceni)
               posuny = posuny - ROZMER;
            aktualni.setX(pozX-posunx);    // prichyceni, zmena souradnic
            aktualni.setY(pozY-posuny); 
            if (pomLog != "") {
              String log = aktualni.getID()+",P:"+aktualni.getX()+":"+aktualni.getY()+" ";
              logovani(log);                    // logovani posunu, kdyz dilek skoncil v hraci plose
              pocitadlo_pohybu = pocitadlo_pohybu+1;
              pomLog = "";
            } 
            kontrola();                    // test, zda neni plocha zaskladana
         } else if (drag) {
            aktualni.setX(aktualni.getX()+2);
            aktualni.setY(aktualni.getY()+3);
         }
      } else if ( drag ) {
         aktualni.setX(aktualni.getX()+2);
         aktualni.setY(aktualni.getY()+3);
      } 
      drag = false;
      repaint();
      e.consume();
   }

   void kontrola() {      // test, zda hra neskoncila  
      char [][] matice;
      int pozX, pozY, m, n;
      boolean nalezeno;
      
      // prochazeni hraci desky
      for (int i=0; i<deska.length;i++) {
         for (int j=0;j<deska[0].length;j++) {
            if ( deska[i][j] == PRAZDNE ){
                continue;
            }
            nalezeno=false;
            pozX=pocatekX + i*ROZMER;
            pozY=pocatekY + j*ROZMER;
            // pro kazde policko hraci plochy zkoumame, zda na nem lezi nejaky dilek
            for (Dilek d : hraciSada) {
               matice = d.getMat();
               m = d.getM();
               n = d.getN();
               for ( int k=0; k<m; k++ ) {
                  for ( int l=0; l<n; l++ ) {  
                     if ( matice[k][l] != PRAZDNE ) {
                        int dilekX = d.getX()+k*ROZMER;
                        int dilekY = d.getY()+l*ROZMER;
                        if ( dilekX > pozX-2 && dilekX < pozX+2 && dilekY > pozY-2 && dilekY < pozY+2 ) {
                          nalezeno=true;
                          
                        }
                     }
                  }
               }
            }
            if (!nalezeno) {
               str="neslozeno";
               return;
            }
         }
      }
      str="slozeno !!!";
      logovani("");   // prazdny retezec naznaci, ze je konec hry
   }


   public void mouseDragged( MouseEvent e ) {   // tazeni dilku
      if ( drag ) {
         
         int new_mx = e.getX();
         int new_my = e.getY();

         aktualni.setX(aktualni.getX() + new_mx - mx);     // pocitani novych souradnic pri tazeni
         aktualni.setY(aktualni.getY() + new_my - my);

         mx = new_mx;
         my = new_my;
         
         pomLog = "zmena";

         repaint();
         e.consume();
      }
   }


   public void gameBoard() {
         
      backg.setColor( new Color(200, 200, 200) );   // barva pozadi
      backg.fillRect(0, 0, width, height);          // vymazani

      // Hraci deska
      
      // vykresleni okraje desky
      int pozX, pozY;
      backg.setColor( new Color(180,180,180) );
      for (int i=0; i<velikostX;i++) {
         for (int j=0;j<velikostY;j++) {
            pozX = pocatekX + i*ROZMER - ROZMER/2;      
            pozY = pocatekY + j*ROZMER - ROZMER/2;
            if ( deska[i][j] != PRAZDNE ) {
               backg.drawImage( img_deska, pozX, pozY, this ); 
            }  else if ( j > 0 && i > 0 ) {
               if ( deska[i-1][j] != PRAZDNE && deska[i][j-1] != PRAZDNE )
                  backg.fillRect( pozX, pozY+ROZMER/2, ROZMER, ROZMER );
            }     
         }
      }
      
      // vykresleni vnitrku
      for (int i=0; i<velikostX;i++) {
         for (int j=0;j<velikostY;j++) {  
            if ( deska[i][j] != PRAZDNE) {
              pozX = pocatekX + i*ROZMER;
              pozY = pocatekY + j*ROZMER;  
              backg.setColor( new Color(200, 200, 200) );
              backg.fillRect( pozX, pozY, ROZMER, ROZMER );      
              backg.setColor( new Color(0,0,0) );
              // vykresleni obvodu policka hraci plochy
              backg.drawLine( pozX, pozY, pozX+ROZMER, pozY ); 
              backg.drawLine( pozX, pozY, pozX, pozY+ROZMER );
              backg.drawLine( pozX+ROZMER, pozY, pozX+ROZMER, pozY+ROZMER ); 
              backg.drawLine( pozX, pozY+ROZMER, pozX+ROZMER, pozY+ROZMER ); 
            }    
         }
      }
      
      // Stinovani hraciho dilku
      char [][] matice;
      int  m, n;
      for (Dilek d : hraciSada) {
         matice = d.getMat();
         m = d.getM();
         n = d.getN();
         backg.setColor( d.getColor() );
         for ( int i=0; i<m; i++ ) {
            for ( int j=0; j<n; j++ ) { 
               if ( matice[i][j] != PRAZDNE ) {
                  pozX = d.getX() + i*ROZMER;
                  pozY = d.getY() + j*ROZMER;
                  backg.drawImage( img_dilekstin, pozX, pozY, this );
               }
            }
         }
      }

      // Hraci dilky
      for (Dilek d : hraciSada) {
         matice = d.getMat();
         m = d.getM();
         n = d.getN();
         backg.setColor( d.getColor() );
         for ( int i=0; i<m; i++ ) {
            for ( int j=0; j<n; j++ ) { 
               if ( matice[i][j] != PRAZDNE ) {
                  pozX = d.getX() + i*ROZMER;
                  pozY = d.getY() + j*ROZMER;
                  backg.fillRect( pozX+1, pozY, ROZMER-1, ROZMER );
                  backg.drawLine( pozX, pozY+2, pozX, pozY+ROZMER-1 ); 
                  backg.drawImage( img_dilek, pozX, pozY, this );
               }
            }
         }
      }

      // vykresleni pomocneho stringu
      backg.setColor(Color.black);   
      backg.drawString(str,10,480);
   }
   


   public void update( Graphics g ) {
      gameBoard();
      g.drawImage( backbuffer, 0, 0, this );
   }

   public void paint( Graphics g ) {
      update( g );
   }
   
   public void rotaceDoleva() {
      aktualni.rotaceDoleva();
      String log = aktualni.getID()+"L ";
      logovani(log);
      pocitadlo_pohybu = pocitadlo_pohybu+1;
      kontrola();
      repaint();
   }
   
   public void rotaceDoprava() {
      aktualni.rotaceDoprava();
      String log = aktualni.getID()+"R ";
      logovani(log);
      pocitadlo_pohybu = pocitadlo_pohybu+1;
      kontrola();
      repaint();
   }
   
   public void zrcadleni() {   
      aktualni.zrcadleni();
      String log = aktualni.getID()+"Z ";
      logovani(log);
      pocitadlo_pohybu = pocitadlo_pohybu+1;
      kontrola();
      repaint();
   }

   void logovani( String popis_tahu ) {
      try {
        URL url;
        if (popis_tahu == "") {
          url = new URL("../../interface/interface.php?session_id="+
                getParameter("session_id")+"&session_hash="+getParameter("session_hash")+
                "&move_number="+pocitadlo_pohybu+"&win=1");  
        } else {
          url = new URL("../../interface/interface.php?session_id="+
                getParameter("session_id")+"&session_hash="+getParameter("session_hash")+
                "&move_number="+pocitadlo_pohybu+"&move="+popis_tahu);  
        }  
        
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
      
  /*    System.out.println("Response code: " + con.getResponseCode());
      System.out.println("Content type: " + con.getContentType());       */
      
        BufferedReader br = new BufferedReader(
              new InputStreamReader(con.getInputStream()));
      
   /*   String s = "";
      while (s != null) {
          s = br.readLine();
          if (s != null)
              System.out.println(s);
      }                                    */
      
      con.disconnect();
      } catch (Exception e) {
      }     
    }         
}

